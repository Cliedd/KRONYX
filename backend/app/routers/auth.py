import secrets
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

IS_PROD = settings.ENVIRONMENT == "production"


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="kronyx_token",
        value=token,
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax",
        max_age=60 * 60 * 24 * 7,  # 7 jours
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key="kronyx_token",
        httponly=True,
        secure=IS_PROD,
        samesite="none" if IS_PROD else "lax",
        path="/",
    )


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        company_name=data.company_name,
        timezone=data.timezone or "UTC",
        notification_emails=[data.email],
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": str(user.id)})
    _set_auth_cookie(response, token)
    return user


@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token({"sub": str(user.id)})
    _set_auth_cookie(response, token)
    return user


@router.post("/logout")
async def logout(response: Response):
    _clear_auth_cookie(response)
    return {"message": "Déconnecté"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


# ─── Google OAuth ────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login(response: RedirectResponse = None):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth non configuré")

    state = secrets.token_urlsafe(32)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    redirect_url = f"{GOOGLE_AUTH_URL}?{query}"

    resp = RedirectResponse(url=redirect_url, status_code=302)
    resp.set_cookie(
        "oauth_state",
        state,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=600,
        path="/",
    )
    return resp


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    stored_state = request.cookies.get("oauth_state")
    if not stored_state or stored_state != state:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=invalid_state")

    try:
        async with httpx.AsyncClient() as client:
            # Échange du code contre un token
            token_res = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=token_exchange")

            # Récupération du profil Google
            info_res = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo = info_res.json()
    except Exception:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_error")

    email = userinfo.get("email")
    google_id = userinfo.get("id")
    if not email:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=no_email")

    # Trouver ou créer l'utilisateur
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Nouveau compte via Google
        user = User(
            email=email,
            password_hash=None,
            company_name=userinfo.get("name", ""),
            google_id=google_id,
            notification_emails=[email],
        )
        db.add(user)
        await db.flush()
    elif not user.google_id:
        # Compte existant → lier à Google
        user.google_id = google_id
        await db.flush()

    jwt_token = create_access_token({"sub": str(user.id)})

    redirect_resp = RedirectResponse(url=f"{settings.FRONTEND_URL}/", status_code=302)
    _set_auth_cookie(redirect_resp, jwt_token)
    redirect_resp.delete_cookie("oauth_state")
    return redirect_resp

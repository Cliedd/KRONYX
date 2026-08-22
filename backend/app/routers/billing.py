import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from app.dependencies import get_current_user
from app.models.user import User
from app.config import settings
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter()


def get_stripe():
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=501, detail="Stripe non configuré")
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


@router.post("/checkout")
async def create_checkout_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    s = get_stripe()

    # Créer ou retrouver le customer Stripe
    if not current_user.stripe_customer_id:
        customer = s.Customer.create(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)},
        )
        current_user.stripe_customer_id = customer["id"]
        await db.flush()

    if not settings.STRIPE_PRICE_PRO_ID:
        raise HTTPException(status_code=501, detail="Prix Stripe Pro non configuré")

    session = s.checkout.Session.create(
        customer=current_user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": settings.STRIPE_PRICE_PRO_ID, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.FRONTEND_URL}/account?success=1",
        cancel_url=f"{settings.FRONTEND_URL}/account?canceled=1",
    )
    return {"checkout_url": session.url}


@router.post("/portal")
async def create_portal_session(
    current_user: User = Depends(get_current_user),
):
    s = get_stripe()

    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="Aucun abonnement actif")

    session = s.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/account",
    )
    return {"portal_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook invalide")

    if event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        customer_id = sub["customer"]
        status_val = sub["status"]

        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.plan = "pro" if status_val == "active" else "starter"
            await db.flush()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        customer_id = sub["customer"]
        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.plan = "starter"
            await db.flush()

    return {"received": True}

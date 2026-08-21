from bs4 import BeautifulSoup
import re
import hashlib


def clean_html_to_text(html: str) -> str:
    """Extrait le texte propre d'un HTML."""
    soup = BeautifulSoup(html, "lxml")

    # Supprimer scripts, styles, nav, footer, headers
    for tag in soup.find_all(["script", "style", "nav", "footer", "header", "noscript", "meta", "link"]):
        tag.decompose()

    # Extraire le texte
    text = soup.get_text(separator="\n", strip=True)

    # Nettoyer les lignes vides multiples
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    text = "\n".join(lines)

    # Normaliser les espaces
    text = re.sub(r" +", " ", text)

    return text


def compute_content_hash(text: str) -> str:
    """Calcule le SHA256 du contenu textuel."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def extract_diff(old_text: str, new_text: str, max_chars: int = 3000) -> str:
    """Extrait les differences entre deux textes."""
    old_lines = set(old_text.splitlines())
    new_lines = set(new_text.splitlines())

    added = [f"+ {line}" for line in new_lines - old_lines if line.strip()]
    removed = [f"- {line}" for line in old_lines - new_lines if line.strip()]

    diff_parts = removed[:30] + added[:30]
    diff_text = "\n".join(diff_parts)

    return diff_text[:max_chars] if len(diff_text) > max_chars else diff_text

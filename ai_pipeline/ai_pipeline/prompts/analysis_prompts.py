SYSTEM_PROMPT = """Tu es un analyste stratégique expert en veille concurrentielle B2B.
Tu analyses les changements détectés sur les sites web de concurrents et produis des notes de synthèse stratégiques concises, actionnables et objectives.

Ton analyse doit être:
- Factuelle (basée uniquement sur les changements observés)
- Stratégique (impact business, pas juste une description)
- Actionnable (que doit faire l'entreprise qui vous lit ?)
- Concise (pas de répétition, aller à l'essentiel)

IMPORTANT: Tu dois TOUJOURS répondre avec un JSON valide, sans texte avant ou après."""


def build_analysis_prompt(
    competitor_name: str,
    page_type: str,
    page_url: str,
    old_content: str,
    new_content: str,
    diff_text: str,
) -> str:
    page_type_labels = {
        "pricing": "page de tarification",
        "blog": "blog",
        "changelog": "journal des modifications (changelog)",
        "custom": "page web",
    }
    page_label = page_type_labels.get(page_type, "page web")

    old_section = (
        old_content[:1500]
        if old_content
        else "Première capture - pas de contenu précédent"
    )

    return f"""Analyse le changement détecté sur la {page_label} du concurrent "{competitor_name}".

URL: {page_url}

CONTENU PRÉCÉDENT (extrait):
{old_section}

NOUVEAU CONTENU (extrait):
{new_content[:1500]}

DIFFÉRENCES DÉTECTÉES:
{diff_text[:1000] if diff_text else "Changement de structure générale"}

Analyse ce changement et retourne UNIQUEMENT ce JSON:
{{
  "summary": "Résumé clair en 1-2 phrases de ce qui a changé et pourquoi c'est important",
  "category": "Une seule valeur parmi: Prix, Fonctionnalité, Positionnement, Communication, Autre",
  "impact_level": "Une seule valeur parmi: low, medium, high",
  "key_changes": ["changement 1", "changement 2", "changement 3"],
  "strategic_recommendation": "Ce que votre équipe devrait faire en réaction à ce changement (1-2 phrases)"
}}

Critères d'impact:
- high: changement de prix majeur, nouvelle fonctionnalité clé, pivot stratégique
- medium: modification de messaging, ajout de contenu blog, mise à jour changelog
- low: corrections mineures, changements cosmétiques"""


IMPACT_REASSESSMENT_PROMPT = """Tu reçois une analyse préliminaire d'un changement concurrentiel.
Réévalue le niveau d'impact en utilisant ton raisonnement approfondi.
Identifie si des signaux stratégiques importants ont été manqués.
Retourne le même format JSON avec tes corrections."""

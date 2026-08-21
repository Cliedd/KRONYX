import json
from openai import AsyncOpenAI
from ai_pipeline.config import settings


class DeepSeekClient:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
        )

    async def analyze(
        self,
        system_prompt: str,
        user_prompt: str,
        use_reasoner: bool = False,
    ) -> str:
        """Envoie une requête à DeepSeek et retourne le texte brut."""
        model = settings.DEEPSEEK_REASONER_MODEL if use_reasoner else settings.DEEPSEEK_MODEL

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3 if not use_reasoner else 0.1,
            max_tokens=2000,
        )

        return response.choices[0].message.content or ""

    async def analyze_with_json_output(
        self,
        system_prompt: str,
        user_prompt: str,
        use_reasoner: bool = False,
    ) -> dict:
        """Analyse et retourne un JSON parsé avec fallback robuste."""
        raw = await self.analyze(system_prompt, user_prompt, use_reasoner)

        raw = raw.strip()

        # Extraire le JSON du bloc de code s'il est présent
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0].strip()
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0].strip()

        # Tenter de trouver le premier objet JSON valide dans la réponse
        brace_start = raw.find("{")
        brace_end = raw.rfind("}")
        if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
            raw = raw[brace_start : brace_end + 1]

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Fallback: structure minimale valide
            return {
                "summary": raw[:500] if raw else "Analyse indisponible",
                "category": "Autre",
                "impact_level": "medium",
                "key_changes": [],
                "strategic_recommendation": "",
            }


deepseek_client = DeepSeekClient()

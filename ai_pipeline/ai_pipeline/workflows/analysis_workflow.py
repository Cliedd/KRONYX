from typing import TypedDict, Optional

from langgraph.graph import StateGraph, END

from ai_pipeline.clients.deepseek_client import deepseek_client
from ai_pipeline.prompts.analysis_prompts import (
    SYSTEM_PROMPT,
    IMPACT_REASSESSMENT_PROMPT,
    build_analysis_prompt,
)


# ---------------------------------------------------------------------------
# State definition
# ---------------------------------------------------------------------------

class AnalysisState(TypedDict):
    # Inputs
    competitor_name: str
    page_type: str
    page_url: str
    old_content: str
    new_content: str
    diff_text: str

    # Intermediate
    initial_analysis: Optional[dict]

    # Output
    final_analysis: Optional[dict]
    error: Optional[str]


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------

async def run_initial_analysis(state: AnalysisState) -> AnalysisState:
    """Etape 1: Analyse initiale avec DeepSeek V3 (economique)."""
    try:
        prompt = build_analysis_prompt(
            competitor_name=state["competitor_name"],
            page_type=state["page_type"],
            page_url=state["page_url"],
            old_content=state["old_content"],
            new_content=state["new_content"],
            diff_text=state["diff_text"],
        )

        result = await deepseek_client.analyze_with_json_output(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=prompt,
            use_reasoner=False,  # DeepSeek V3 — cheap & fast
        )

        return {**state, "initial_analysis": result, "error": None}
    except Exception as exc:
        return {**state, "initial_analysis": None, "error": str(exc)}


def should_use_reasoner(state: AnalysisState) -> str:
    """Router conditionnel: DeepSeek R1 uniquement si impact=high."""
    analysis = state.get("initial_analysis")
    if analysis and analysis.get("impact_level") == "high":
        return "deep_analysis"
    return "finalize"


async def run_deep_analysis(state: AnalysisState) -> AnalysisState:
    """Etape 2 (optionnelle): Raisonnement approfondi avec DeepSeek R1 pour les impacts high."""
    try:
        initial = state["initial_analysis"]

        prompt = f"""Analyse initiale:
{str(initial)}

Contexte: {state['competitor_name']} - {state['page_type']}
URL: {state['page_url']}
Diff: {state['diff_text'][:500]}

{IMPACT_REASSESSMENT_PROMPT}"""

        result = await deepseek_client.analyze_with_json_output(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=prompt,
            use_reasoner=True,  # DeepSeek R1 — expensive, high quality
        )

        return {**state, "final_analysis": result}
    except Exception:
        # Fallback silencieux sur l'analyse initiale
        return {**state, "final_analysis": state["initial_analysis"]}


async def finalize(state: AnalysisState) -> AnalysisState:
    """Etape finale pour les impacts medium/low: promote l'analyse initiale."""
    return {**state, "final_analysis": state["initial_analysis"]}


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def create_analysis_workflow():
    workflow = StateGraph(AnalysisState)

    workflow.add_node("initial_analysis", run_initial_analysis)
    workflow.add_node("deep_analysis", run_deep_analysis)
    workflow.add_node("finalize", finalize)

    workflow.set_entry_point("initial_analysis")

    workflow.add_conditional_edges(
        "initial_analysis",
        should_use_reasoner,
        {
            "deep_analysis": "deep_analysis",
            "finalize": "finalize",
        },
    )

    workflow.add_edge("deep_analysis", END)
    workflow.add_edge("finalize", END)

    return workflow.compile()


analysis_graph = create_analysis_workflow()


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def analyze_change(
    competitor_name: str,
    page_type: str,
    page_url: str,
    old_content: str,
    new_content: str,
    diff_text: str,
) -> dict:
    """
    Lance le workflow LangGraph complet et retourne le dict d'analyse final.

    Retourne toujours un dict valide avec les clés:
      summary, category, impact_level, key_changes, strategic_recommendation
    """
    initial_state: AnalysisState = {
        "competitor_name": competitor_name,
        "page_type": page_type,
        "page_url": page_url,
        "old_content": old_content,
        "new_content": new_content,
        "diff_text": diff_text,
        "initial_analysis": None,
        "final_analysis": None,
        "error": None,
    }

    result = await analysis_graph.ainvoke(initial_state)

    # Priorité: final_analysis > initial_analysis > fallback minimal
    analysis = result.get("final_analysis") or result.get("initial_analysis")

    if not analysis:
        return {
            "summary": f"Changement détecté sur {page_type} de {competitor_name}",
            "category": "Autre",
            "impact_level": "medium",
            "key_changes": [],
            "strategic_recommendation": "",
        }

    return analysis

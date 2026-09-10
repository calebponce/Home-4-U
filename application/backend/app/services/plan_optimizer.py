from __future__ import annotations

from itertools import product
from typing import Any, Iterable


PROFILE_CONFIG = (
    {
        "key": "economical",
        "title": "Economical",
        "budget_ratio": 0.60,
        "description": "Protect cash and fund the highest-priority changes first.",
        "weights": {"coverage": 0.22, "priority": 0.30, "value": 0.42, "style": 0.06},
    },
    {
        "key": "balanced",
        "title": "Balanced",
        "budget_ratio": 0.85,
        "description": "Balance room coverage, priority, style fit, and cost efficiency.",
        "weights": {"coverage": 0.30, "priority": 0.28, "value": 0.20, "style": 0.22},
    },
    {
        "key": "design-focused",
        "title": "Design Focused",
        "budget_ratio": 1.00,
        "description": "Maximize style impact while staying inside the full budget.",
        "weights": {"coverage": 0.30, "priority": 0.20, "value": 0.05, "style": 0.45},
    },
)

MATCH_QUALITY = {
    "best fit": 1.0,
    "best value": 0.82,
    "alternate pick": 0.68,
}


def _as_money(value: Any) -> float:
    try:
        return round(max(0.0, float(value or 0.0)), 2)
    except (TypeError, ValueError):
        return 0.0


def _candidate_quality(candidate: dict) -> float:
    match_quality = MATCH_QUALITY.get(str(candidate.get("match_label") or "").lower(), 0.62)
    catalog_bonus = 0.04 if candidate.get("source_kind") == "catalog" else 0.0
    return min(1.0, match_quality + catalog_bonus)


def _candidate_value(candidate: dict, allocation: float) -> float:
    cost = _as_money(candidate.get("estimated_cost"))
    if cost <= 0:
        return 0.0
    target = max(1.0, allocation)
    return min(1.0, target / cost)


def _product_candidates(item: dict) -> list[dict]:
    candidates = []
    for candidate in item.get("products") or []:
        cost = _as_money(candidate.get("estimated_cost"))
        if cost <= 0:
            continue
        candidates.append(
            {
                "key": str(candidate.get("key") or f"{item.get('key')}-candidate-{len(candidates) + 1}"),
                "name": str(candidate.get("name") or item.get("label") or "Plan item"),
                "retailer": str(candidate.get("retailer") or "Retailer"),
                "estimated_cost": cost,
                "match_label": str(candidate.get("match_label") or "Candidate"),
                "source_kind": str(candidate.get("source_kind") or "search"),
                "url": candidate.get("url"),
                "quality": _candidate_quality(candidate),
                "value": _candidate_value(candidate, _as_money(item.get("estimated_cost"))),
            }
        )

    if candidates:
        return candidates[:3]

    allocation = _as_money(item.get("estimated_cost"))
    if allocation <= 0:
        return []
    return [
        {
            "key": f"{item.get('key')}-allocation",
            "name": str(item.get("label") or "Plan item"),
            "retailer": "Budget allocation",
            "estimated_cost": allocation,
            "match_label": "Planned item",
            "source_kind": "allocation",
            "url": None,
            "quality": 0.72,
            "value": 1.0,
        }
    ]


def _iter_valid_combinations(groups: list[list[dict]], ceiling: float) -> Iterable[tuple[dict | None, ...]]:
    choices = [[None, *group] for group in groups]
    for combination in product(*choices):
        if not any(combination):
            continue
        total = sum(candidate["estimated_cost"] for candidate in combination if candidate)
        if total <= ceiling + 0.005:
            yield combination


def _score_combination(
    combination: tuple[dict | None, ...],
    *,
    priority_weights: list[float],
    profile: dict,
) -> tuple[float, dict]:
    selected = [(index, candidate) for index, candidate in enumerate(combination) if candidate]
    selected_indexes = {index for index, _ in selected}
    coverage = len(selected) / max(1, len(combination))
    priority_total = sum(priority_weights) or 1.0
    priority_coverage = sum(
        weight for index, weight in enumerate(priority_weights) if index in selected_indexes
    ) / priority_total
    value = sum(candidate["value"] for _, candidate in selected) / max(1, len(selected))
    style = sum(candidate["quality"] for _, candidate in selected) / max(1, len(selected))
    weights = profile["weights"]
    objective = (
        coverage * weights["coverage"]
        + priority_coverage * weights["priority"]
        + value * weights["value"]
        + style * weights["style"]
    )
    return objective, {
        "coverage": coverage,
        "priority_coverage": priority_coverage,
        "value": value,
        "style": style,
    }


def _select_scenario(
    *,
    shopping_plan: list[dict],
    groups: list[list[dict]],
    project_budget: float,
    profile: dict,
) -> tuple[dict, int]:
    ceiling = round(project_budget * profile["budget_ratio"], 2)
    priority_weights = [float(len(groups) - index) for index in range(len(groups))]
    best: tuple[float, float, tuple[dict | None, ...], dict] | None = None
    evaluated = 0

    for combination in _iter_valid_combinations(groups, ceiling):
        evaluated += 1
        objective, components = _score_combination(
            combination,
            priority_weights=priority_weights,
            profile=profile,
        )
        total = round(sum(candidate["estimated_cost"] for candidate in combination if candidate), 2)
        tie_breaker = -total if profile["key"] == "economical" else total
        candidate_rank = (objective, tie_breaker)
        if best is None or candidate_rank > (best[0], best[1]):
            best = (objective, tie_breaker, combination, components)

    if best is None:
        combination = tuple(None for _ in groups)
        components = {"coverage": 0.0, "priority_coverage": 0.0, "value": 0.0, "style": 0.0}
        objective = 0.0
    else:
        objective, _, combination, components = best

    items = []
    excluded_items = []
    for index, (shopping_item, candidate) in enumerate(zip(shopping_plan, combination)):
        if candidate is None:
            excluded_items.append(str(shopping_item.get("label") or f"Step {index + 1}"))
            continue
        items.append(
            {
                "plan_item_key": str(shopping_item.get("key") or f"step-{index + 1}"),
                "plan_item_label": str(shopping_item.get("label") or f"Step {index + 1}"),
                "category": str(shopping_item.get("category") or "Room update"),
                "room_zone": str(shopping_item.get("room_zone") or "Room"),
                "priority_rank": index + 1,
                "product_key": candidate["key"],
                "product_name": candidate["name"],
                "retailer": candidate["retailer"],
                "estimated_cost": candidate["estimated_cost"],
                "match_label": candidate["match_label"],
                "source_kind": candidate["source_kind"],
                "url": candidate["url"],
            }
        )

    total_cost = round(sum(item["estimated_cost"] for item in items), 2)
    remaining = round(project_budget - total_cost, 2)
    return {
        "key": profile["key"],
        "title": profile["title"],
        "description": profile["description"],
        "budget_ceiling": ceiling,
        "total_cost": total_cost,
        "budget_remaining": remaining,
        "budget_usage_percent": round((total_cost / project_budget) * 100, 1),
        "coverage_count": len(items),
        "coverage_total": len(shopping_plan),
        "coverage_percent": round(components["coverage"] * 100, 1),
        "impact_score": round(objective * 100, 1),
        "constraint_status": "valid",
        "items": items,
        "excluded_items": excluded_items,
    }, evaluated


def optimize_shopping_plan(*, shopping_plan: list[dict], project_budget: float) -> dict | None:
    """Evaluate grouped product choices and return three budget-valid strategies.

    The search is exhaustive for the bounded shortlist: each recommendation may be
    skipped or assigned one of at most three product candidates. That makes the
    result deterministic and easy to audit while preserving hard constraints.
    """
    budget = _as_money(project_budget)
    bounded_plan = list(shopping_plan or [])[:8]
    if budget <= 0 or not bounded_plan:
        return None

    groups = [_product_candidates(item) for item in bounded_plan]
    if not any(groups):
        return None

    scenarios = []
    evaluated_combinations = 0
    for profile in PROFILE_CONFIG:
        scenario, evaluated = _select_scenario(
            shopping_plan=bounded_plan,
            groups=groups,
            project_budget=budget,
            profile=profile,
        )
        scenarios.append(scenario)
        evaluated_combinations += evaluated

    return {
        "algorithm": "Bounded grouped exhaustive search",
        "project_budget": budget,
        "currency": "USD",
        "evaluated_combinations": evaluated_combinations,
        "hard_constraints": [
            "Never exceed the strategy budget ceiling",
            "Select at most one product for each recommendation",
            "Use only products attached to the saved analysis",
        ],
        "assumptions": [
            "Prices are planning estimates and should be verified with the retailer",
            "Product dimensions are not yet available, so spatial fit is not enforced",
        ],
        "scenarios": scenarios,
    }

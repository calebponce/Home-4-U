import json

from app.services.plan_optimizer import optimize_shopping_plan


def _shopping_item(index: int) -> dict:
    key = f"item-{index}"
    return {
        "key": key,
        "label": f"Room update {index}",
        "category": "Furniture" if index == 1 else "Decor",
        "room_zone": f"Zone {index}",
        "estimated_cost": 230.0,
        "products": [
            {
                "key": f"{key}-fit",
                "name": f"Design pick {index}",
                "retailer": "Design Store",
                "estimated_cost": 250.0,
                "match_label": "Best Fit",
                "source_kind": "catalog",
                "url": "https://example.com/fit",
            },
            {
                "key": f"{key}-value",
                "name": f"Value pick {index}",
                "retailer": "Value Store",
                "estimated_cost": 140.0,
                "match_label": "Best Value",
                "source_kind": "search",
                "url": "https://example.com/value",
            },
            {
                "key": f"{key}-alternate",
                "name": f"Alternate pick {index}",
                "retailer": "Alternate Store",
                "estimated_cost": 180.0,
                "match_label": "Alternate Pick",
                "source_kind": "search",
                "url": "https://example.com/alternate",
            },
        ],
    }


def test_optimizer_returns_distinct_budget_valid_strategies():
    shopping_plan = [_shopping_item(index) for index in range(1, 5)]

    result = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=1000.0)

    assert result is not None
    assert result["algorithm"] == "Bounded grouped exhaustive search"
    assert result["evaluated_combinations"] > 0
    assert [scenario["key"] for scenario in result["scenarios"]] == [
        "economical",
        "balanced",
        "design-focused",
    ]

    economical, balanced, design_focused = result["scenarios"]
    assert economical["total_cost"] <= economical["budget_ceiling"] == 600.0
    assert balanced["total_cost"] <= balanced["budget_ceiling"] == 850.0
    assert design_focused["total_cost"] <= design_focused["budget_ceiling"] == 1000.0
    assert economical["total_cost"] < design_focused["total_cost"]
    assert {item["match_label"] for item in economical["items"]} == {"Best Value"}
    assert {item["match_label"] for item in design_focused["items"]} == {"Best Fit"}

    for scenario in result["scenarios"]:
        item_keys = [item["plan_item_key"] for item in scenario["items"]]
        assert len(item_keys) == len(set(item_keys))
        assert scenario["constraint_status"] == "valid"
        assert scenario["budget_remaining"] >= 0


def test_optimizer_is_deterministic_and_handles_missing_inputs():
    shopping_plan = [_shopping_item(index) for index in range(1, 4)]

    first = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=800.0)
    second = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=800.0)

    assert first == second
    assert optimize_shopping_plan(shopping_plan=[], project_budget=800.0) is None
    assert optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=0.0) is None


def test_optimizer_preserves_hard_invariants_across_budget_and_candidate_edges():
    shopping_plan = [_shopping_item(index) for index in range(1, 5)]
    shopping_plan.append(
        {
            "key": "allocation-only",
            "label": "Allocation-only update",
            "category": "Decor",
            "room_zone": "Entry",
            "estimated_cost": 85.0,
            "products": [
                {"key": "ignored-free", "estimated_cost": 0},
                {"key": "ignored-negative", "estimated_cost": -10},
            ],
        }
    )

    allowed_product_keys = {
        candidate["key"]
        for item in shopping_plan
        for candidate in item.get("products", [])
        if candidate.get("estimated_cost", 0) > 0
    }
    allowed_product_keys.add("allocation-only-allocation")

    for budget in (1.0, 275.55, 820.0, 1600.0):
        result = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=budget)

        assert result is not None
        assert result["candidate_combinations_per_scenario"] == (4**4 * 2) - 1
        assert result["candidate_combinations_total"] == result["candidate_combinations_per_scenario"] * 3

        for scenario in result["scenarios"]:
            selected_keys = [item["plan_item_key"] for item in scenario["items"]]
            selected_cost = round(sum(item["estimated_cost"] for item in scenario["items"]), 2)

            assert scenario["total_cost"] == selected_cost
            assert scenario["total_cost"] <= scenario["budget_ceiling"] + 0.005
            assert scenario["budget_remaining"] == round(budget - selected_cost, 2)
            assert scenario["coverage_count"] == len(scenario["items"])
            assert scenario["coverage_count"] + len(scenario["excluded_items"]) == len(shopping_plan)
            assert len(selected_keys) == len(set(selected_keys))
            assert all(item["estimated_cost"] > 0 for item in scenario["items"])
            assert all(item["product_key"] in allowed_product_keys for item in scenario["items"])


def test_optimizer_bounds_the_search_to_eight_recommendations():
    shopping_plan = [_shopping_item(index) for index in range(1, 11)]

    result = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=6000.0)

    assert result is not None
    assert all(scenario["coverage_total"] == 8 for scenario in result["scenarios"])
    assert result["candidate_combinations_per_scenario"] == (4**8) - 1
    assert result["candidate_combinations_total"] == ((4**8) - 1) * 3


def test_optimizer_rejects_non_finite_money_without_emitting_invalid_json():
    shopping_plan = [_shopping_item(1)]
    for invalid_budget in (float("inf"), float("-inf"), float("nan"), "Infinity"):
        assert optimize_shopping_plan(
            shopping_plan=shopping_plan, project_budget=invalid_budget
        ) is None

    shopping_plan[0]["products"][0]["estimated_cost"] = float("inf")
    shopping_plan[0]["products"][1]["estimated_cost"] = float("nan")
    result = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=800.0)

    assert result is not None
    assert result["candidate_combinations_per_scenario"] == 1
    assert all(
        item["product_key"] == "item-1-alternate"
        for scenario in result["scenarios"]
        for item in scenario["items"]
    )
    json.dumps(result, allow_nan=False)


def test_unsourced_step_is_disclosed_as_an_allocation_not_a_product():
    result = optimize_shopping_plan(
        shopping_plan=[{"key": "paint", "label": "Paint", "estimated_cost": 80.0}],
        project_budget=300.0,
    )

    assert result is not None
    assert all(
        scenario["items"][0]["source_kind"] == "allocation"
        for scenario in result["scenarios"]
    )
    assert any("not purchasable products" in note for note in result["assumptions"])


if __name__ == "__main__":
    test_optimizer_returns_distinct_budget_valid_strategies()
    test_optimizer_is_deterministic_and_handles_missing_inputs()
    test_optimizer_preserves_hard_invariants_across_budget_and_candidate_edges()
    test_optimizer_bounds_the_search_to_eight_recommendations()
    test_optimizer_rejects_non_finite_money_without_emitting_invalid_json()
    test_unsourced_step_is_disclosed_as_an_allocation_not_a_product()
    print("plan optimizer tests passed")

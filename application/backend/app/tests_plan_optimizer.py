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


if __name__ == "__main__":
    test_optimizer_returns_distinct_budget_valid_strategies()
    test_optimizer_is_deterministic_and_handles_missing_inputs()
    print("plan optimizer tests passed")

"""Reproducible benchmark for Home4U's bounded plan optimizer.

Run from ``application/backend``:

    # PowerShell (Windows)
    $env:PYTHONPATH = "."
    python app/benchmark_plan_optimizer.py

    # macOS / Linux
    PYTHONPATH=. python app/benchmark_plan_optimizer.py

The benchmark exercises the documented maximum of eight recommendations with
three product candidates each: 4^8 - 1 non-empty combinations per strategy.
Timing is reported for comparison on the same machine; correctness checks keep
the benchmark from becoming a performance-only claim.
"""

from __future__ import annotations

import argparse
from statistics import median
from time import perf_counter

from app.services.plan_optimizer import optimize_shopping_plan


def _benchmark_item(index: int) -> dict:
    key = f"benchmark-{index}"
    return {
        "key": key,
        "label": f"Benchmark update {index}",
        "category": "Furniture" if index % 2 else "Decor",
        "room_zone": f"Zone {index}",
        "estimated_cost": 320.0,
        "products": [
            {
                "key": f"{key}-fit",
                "name": f"Design pick {index}",
                "retailer": "Design Store",
                "estimated_cost": 360.0,
                "match_label": "Best Fit",
                "source_kind": "catalog",
            },
            {
                "key": f"{key}-value",
                "name": f"Value pick {index}",
                "retailer": "Value Store",
                "estimated_cost": 240.0,
                "match_label": "Best Value",
                "source_kind": "search",
            },
            {
                "key": f"{key}-alternate",
                "name": f"Alternate pick {index}",
                "retailer": "Alternate Store",
                "estimated_cost": 300.0,
                "match_label": "Alternate Pick",
                "source_kind": "search",
            },
        ],
    }


def _assert_invariants(result: dict, budget: float) -> None:
    for scenario in result["scenarios"]:
        selected_keys = [item["plan_item_key"] for item in scenario["items"]]
        selected_cost = round(sum(item["estimated_cost"] for item in scenario["items"]), 2)

        assert scenario["constraint_status"] == "valid"
        assert len(selected_keys) == len(set(selected_keys))
        assert selected_cost == scenario["total_cost"]
        assert selected_cost <= scenario["budget_ceiling"] + 0.005
        assert scenario["budget_remaining"] == round(budget - selected_cost, 2)


def run_benchmark(*, runs: int = 3, budget: float = 4000.0) -> dict:
    shopping_plan = [_benchmark_item(index) for index in range(1, 9)]
    durations = []
    result = None

    for _ in range(runs):
        started = perf_counter()
        result = optimize_shopping_plan(shopping_plan=shopping_plan, project_budget=budget)
        durations.append(perf_counter() - started)

    assert result is not None
    assert result["candidate_combinations_per_scenario"] == (4**8) - 1
    assert result["candidate_combinations_total"] == ((4**8) - 1) * 3
    _assert_invariants(result, budget)

    return {
        "runs": runs,
        "median_seconds": median(durations),
        "minimum_seconds": min(durations),
        "candidate_combinations_per_scenario": result["candidate_combinations_per_scenario"],
        "candidate_combinations_total": result["candidate_combinations_total"],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark the bounded Home4U plan optimizer.")
    parser.add_argument("--runs", type=int, default=3, help="number of runs used for the median")
    args = parser.parse_args()
    if args.runs < 1:
        raise SystemExit("--runs must be at least 1")

    benchmark = run_benchmark(runs=args.runs)
    print("Home4U optimizer benchmark")
    print(f"runs: {benchmark['runs']}")
    print(f"candidate combinations per strategy: {benchmark['candidate_combinations_per_scenario']:,}")
    print(f"candidate combinations across all strategies: {benchmark['candidate_combinations_total']:,}")
    print(f"median: {benchmark['median_seconds']:.3f}s")
    print(f"minimum: {benchmark['minimum_seconds']:.3f}s")


if __name__ == "__main__":
    main()

#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")" || exit 1

PYTHON_BIN="${HOME4U_PYTHON_BIN:-}"

if [ -z "$PYTHON_BIN" ]; then
    if [ -x ".venv/bin/python" ]; then
        PYTHON_BIN=".venv/bin/python"
    elif command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python3)"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_BIN="$(command -v python)"
    else
        echo "Python was not found. Create .venv or install Python 3.12."
        exit 1
    fi
fi

export PYTHONPATH=.

echo "Running backend smoke tests..."
"$PYTHON_BIN" app/tests_api_smoke.py
"$PYTHON_BIN" app/tests_search_smoke.py
"$PYTHON_BIN" app/tests_workspace_analysis_smoke.py
"$PYTHON_BIN" app/tests_analysis_quality_benchmark.py
"$PYTHON_BIN" app/tests_plan_optimizer.py
"$PYTHON_BIN" app/tests_auth_rate_limit.py

echo "All backend smoke tests passed."

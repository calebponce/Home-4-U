#!/bin/bash

# Navigate to backend directory (assumes script is in application/backend/)
cd "$(dirname "$0")" || exit 1

# Check if virtual environment exists, if not create it
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies if needed
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt 2>/dev/null
fi

# Start the backend server
echo "Starting Home4U Backend Server..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


#!/bin/bash

# Start FastAPI backend in background
cd backend && python -u main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend started with PID: $BACKEND_PID on port 8000"
sleep 2

# Start Frontend
NODE_ENV=development tsx server/index.ts

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT

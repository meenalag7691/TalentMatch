#!/usr/bin/env bash
set -e

echo "======================================================="
echo "  TalentMatch AI - Production Full-Stack Server"
echo "======================================================="
echo ""

PORT="${PORT:-8000}"
echo "Starting FastAPI Server on port $PORT..."
echo "Access in your browser at: http://127.0.0.1:$PORT"
echo ""

exec uvicorn server:app --host 0.0.0.0 --port "$PORT"

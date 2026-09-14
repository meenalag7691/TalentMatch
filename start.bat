@echo off
echo =======================================================
echo   TalentMatch AI - Production Full-Stack Server
echo =======================================================
echo.
echo Checking virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Running uv sync...
    uv sync
)

echo Starting FastAPI Server with built React dashboard...
echo Access in your browser at: http://127.0.0.1:8000
echo.
.venv\Scripts\python.exe server.py
pause

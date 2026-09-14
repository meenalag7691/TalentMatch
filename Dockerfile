# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Production Server
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system utilities if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files and install
COPY pyproject.toml uv.lock* ./
RUN uv pip install --system --no-cache -r pyproject.toml || \
    pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    python-multipart \
    groq \
    pydantic \
    pypdf \
    python-docx \
    python-dotenv

# Copy application source code
COPY server.py resume_parser.py ./
COPY resumes/ ./resumes/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

# Run FastAPI server on dynamically assigned PORT (e.g. Render/Railway)
CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}

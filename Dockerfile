# Dockerfile (lean / arm64-friendly)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install system/build deps (poppler included; remove if you don't need it)
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      build-essential gcc g++ python3-dev libxml2-dev libxslt1-dev \
      poppler-utils ttf-dejavu-core procps curl ca-certificates \
      && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/requirements.txt

# App user
RUN useradd --create-home appuser
WORKDIR /app
COPY . /app
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Use gunicorn + uvicorn worker
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "300"]
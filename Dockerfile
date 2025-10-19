FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install minimal system deps
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      build-essential gcc python3-dev \
      && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

# App user
RUN useradd --create-home appuser
COPY . /app
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "300"]
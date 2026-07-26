FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy application source code
COPY . /app

EXPOSE 8000

CMD ["uvicorn", "api.views.document_views:app", "--host", "0.0.0.0", "--port", "8000"]

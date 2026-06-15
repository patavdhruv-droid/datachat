FROM python:3.11-slim

# Set working directory
WORKDIR /app

# System dependencies for matplotlib/seaborn
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libfreetype6-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caching optimization)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/database /app/uploads /app/charts && \
    chmod -R 777 /app/database /app/uploads /app/charts

# Hugging Face Spaces expects port 7860
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
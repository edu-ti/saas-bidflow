FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    requests \
    beautifulsoup4 \
    selenium \
    webdriver-manager \
    python-dotenv \
    lxml \
    pillow

WORKDIR /app

COPY bidflow_rpa_robot.py /app/
COPY requirements.txt /app/

RUN mkdir -p /app/downloads

ENV PYTHONUNBUFFERED=1

CMD ["python", "bidflow_rpa_robot.py"]
FROM python:3.9-alpine

RUN apk add --no-cache \
    gcc \
    musl-dev \
    python3-dev \
    wget

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sp.py .

EXPOSE 5002

CMD ["python", "sp.py"]
FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "app.py"]
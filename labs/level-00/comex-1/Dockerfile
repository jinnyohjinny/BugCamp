FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache iputils

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser -D -s /bin/sh appuser
USER appuser

EXPOSE 8080

CMD ["python", "app.py"]
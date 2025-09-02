FROM node:18-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p /app/logs \
    && mkdir -p /app/uploads

EXPOSE 3000

CMD ["npm", "start"]
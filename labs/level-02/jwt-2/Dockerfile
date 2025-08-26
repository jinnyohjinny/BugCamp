FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs \
    && mkdir -p /app/uploads

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

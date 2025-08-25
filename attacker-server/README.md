# Web Attacker Server

A simple web server designed for pentesting labs to host exploit files and monitor request logs. This server provides a clean interface for uploading, managing, and downloading files while maintaining detailed logs of all incoming requests.

## Features

- **File Hosting**: Upload and host exploit files, payloads, and other tools
- **Request Logging**: Comprehensive logging of all HTTP requests with detailed information
- **Web Interface**: Modern, responsive web dashboard with dark theme
- **Real-time Monitoring**: View request logs in real-time with pagination
- **File Management**: Easy upload/download functionality with drag-and-drop support
- **Docker Support**: Fully containerized for easy deployment
- **Health Monitoring**: Built-in health check endpoint

## Security Considerations

⚠️ **IMPORTANT**: This server is designed for educational purposes and pentesting labs only. Do not deploy in production environments.

- Runs as non-root user in Docker
- File upload size limits (16MB max)
- Secure filename handling
- Request logging for audit trails
- Isolated network configuration

## Quick Start

### Using Docker Compose (Recommended)

1. Clone or download the project files
2. Navigate to the attacker-server directory
3. Run the server:

```bash
docker-compose up -d
```

4. Access the web interface at `http://localhost:8083`

### Using Docker

```bash
# Build the image
docker build -t web-attacker-server .

# Run the container
docker run -d \
  --name web-attacker-server \
  -p 8083:8080 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  web-attacker-server
```

### Manual Setup

1. Install Python 3.11+
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

## Usage

### Web Interface

- **Dashboard** (`/`): Overview of hosted files and request statistics
- **Upload** (`/upload`): Upload new files with drag-and-drop support
- **Logs** (`/logs`): View detailed request logs with pagination
- **Health** (`/health`): Server health check endpoint

### API Endpoints

- `GET /` - Main dashboard
- `GET /logs` - View request logs (web interface)
- `GET /api/logs` - JSON API for request logs
- `GET /files/<filename>` - Download a file
- `POST /upload` - Upload a file
- `POST /clear-logs` - Clear all request logs
- `GET /health` - Health check

### File Management

Files are stored in the `uploads/` directory and can be:
- Uploaded via the web interface
- Downloaded via direct URL access
- Managed through the dashboard

### Logging

Request logs include:
- Timestamp and HTTP method
- Full URL and path
- Request headers
- Query parameters and form data
- Client IP address
- User agent information
- Request body (for POST requests)

Logs are stored in:
- Memory (last 1000 requests)
- `request_logs.json` file
- `logs/server.log` for server events

## Configuration

### Environment Variables

- `FLASK_ENV`: Set to `production` for production mode
- `PYTHONUNBUFFERED`: Set to `1` for immediate log output

### File Structure

```
attacker-server/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── README.md             # This file
├── templates/            # HTML templates
│   ├── index.html        # Dashboard template
│   ├── logs.html         # Logs viewing template
│   └── upload.html       # File upload template
├── uploads/              # Hosted files (created automatically)
├── logs/                 # Server logs (created automatically)
└── request_logs.json     # Request logs (created automatically)
```

## Monitoring and Maintenance

### Health Checks

The server includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "request_count": 42
}
```

### Log Management

- Request logs are automatically limited to 1000 entries in memory
- Logs are persisted to `request_logs.json`
- Use the "Clear Logs" button to reset all logs
- Server logs are written to `logs/server.log`

### Performance

- Lightweight Flask application
- Efficient request logging with threading
- Pagination for large log files
- Optimized for small to medium traffic loads

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in docker-compose.yml or use a different port
2. **Permission denied**: Ensure proper file permissions for uploads and logs directories
3. **File upload fails**: Check file size limits (16MB max)
4. **Container won't start**: Check Docker logs with `docker-compose logs`

### Logs

Check container logs:
```bash
docker-compose logs -f attacker-server
```

Check server logs:
```bash
tail -f logs/server.log
```

## Development

### Local Development

1. Install dependencies: `pip install -r requirements.txt`
2. Run in debug mode: `FLASK_ENV=development python app.py`
3. Access at `http://localhost:8083`

### Adding Features

The application is modular and easy to extend:
- Add new routes in `app.py`
- Create new templates in `templates/`
- Modify logging behavior in the `log_request()` function
- Add new file types or validation in upload handling

## License

This project is for educational purposes only. Use responsibly and only in controlled environments.

## Contributing

Feel free to submit issues and enhancement requests for educational pentesting lab improvements.

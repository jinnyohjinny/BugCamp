#!/usr/bin/env python3
"""
Web Attacker Server for Pentesting Labs
A simple web server to host exploit files and log requests for analysis.
"""

from flask import Flask, request, render_template, send_from_directory, jsonify
import os
import json
import datetime
import logging
from werkzeug.utils import secure_filename
import threading
import time
import hashlib
import hmac
import base64
from functools import wraps

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['LOGS_FILE'] = 'request_logs.json'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['WEBHOOK_URL'] = os.environ.get('WEBHOOK_URL', '')
app.config['WEBHOOK_SECRET'] = os.environ.get('WEBHOOK_SECRET', '')
app.config['RATE_LIMIT'] = int(os.environ.get('RATE_LIMIT', '100'))  # requests per minute

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('logs', exist_ok=True)

# Configure logging
try:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/server.log'),
            logging.StreamHandler()
        ]
    )
except PermissionError:
    # Fallback to console-only logging if file logging fails
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler()
        ]
    )
    logging.warning("File logging disabled due to permission issues")

# Global variable to store request logs
request_logs = []
log_lock = threading.Lock()

# Rate limiting storage
rate_limit_store = {}
rate_limit_lock = threading.Lock()

def rate_limit(f):
    """Rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = request.remote_addr
        current_time = time.time()
        
        with rate_limit_lock:
            if client_ip not in rate_limit_store:
                rate_limit_store[client_ip] = []
            
            # Remove old requests (older than 1 minute)
            rate_limit_store[client_ip] = [
                req_time for req_time in rate_limit_store[client_ip] 
                if current_time - req_time < 60
            ]
            
            # Check if rate limit exceeded
            if len(rate_limit_store[client_ip]) >= app.config['RATE_LIMIT']:
                logging.warning(f"Rate limit exceeded for {client_ip}")
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            # Add current request
            rate_limit_store[client_ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function

def send_webhook(log_entry):
    """Send webhook notification if configured"""
    if not app.config['WEBHOOK_URL']:
        return
    
    try:
        import requests
        
        # Prepare webhook payload
        payload = {
            'timestamp': log_entry['timestamp'],
            'method': log_entry['method'],
            'url': log_entry['url'],
            'ip': log_entry['remote_addr'],
            'user_agent': log_entry['user_agent'],
            'path': log_entry['path']
        }
        
        headers = {'Content-Type': 'application/json'}
        
        # Add signature if secret is configured
        if app.config['WEBHOOK_SECRET']:
            signature = hmac.new(
                app.config['WEBHOOK_SECRET'].encode(),
                json.dumps(payload).encode(),
                hashlib.sha256
            ).hexdigest()
            headers['X-Webhook-Signature'] = f'sha256={signature}'
        
        # Send webhook
        response = requests.post(
            app.config['WEBHOOK_URL'],
            json=payload,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            logging.info(f"Webhook sent successfully for {log_entry['remote_addr']}")
        else:
            logging.error(f"Webhook failed with status {response.status_code}")
            
    except Exception as e:
        logging.error(f"Failed to send webhook: {e}")

def log_request():
    """Log the current request details"""
    with log_lock:
        log_entry = {
            'timestamp': datetime.datetime.now().isoformat(),
            'method': request.method,
            'url': request.url,
            'path': request.path,
            'headers': dict(request.headers),
            'args': dict(request.args),
            'form_data': dict(request.form),
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'referrer': request.headers.get('Referer', ''),
            'content_type': request.headers.get('Content-Type', ''),
            'content_length': request.headers.get('Content-Length', ''),
        }
        
        # Add request body for POST requests (limited to 1KB to avoid huge logs)
        if request.method == 'POST':
            try:
                body = request.get_data(as_text=True)
                log_entry['body'] = body[:1024] + ('...' if len(body) > 1024 else '')
            except:
                log_entry['body'] = '[Binary data]'
        
        request_logs.append(log_entry)
        
        # Keep only last 1000 requests to prevent memory issues
        if len(request_logs) > 1000:
            request_logs.pop(0)
        
        # Save to file
        try:
            with open(app.config['LOGS_FILE'], 'w') as f:
                json.dump(request_logs, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save logs: {e}")
        
        logging.info(f"Request logged: {request.method} {request.path} from {request.remote_addr}")
        
        # Send webhook notification
        threading.Thread(target=send_webhook, args=(log_entry,)).start()

@app.before_request
def before_request():
    """Log all requests"""
    log_request()

@app.route('/')
@rate_limit
def index():
    """Main dashboard page"""
    files = []
    try:
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(file_path):
                stat = os.stat(file_path)
                files.append({
                    'name': filename,
                    'size': stat.st_size,
                    'modified': datetime.datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
    except Exception as e:
        logging.error(f"Error listing files: {e}")
    
    return render_template('index.html', files=files, request_count=len(request_logs))

@app.route('/logs')
@rate_limit
def view_logs():
    """View request logs"""
    page = request.args.get('page', 1, type=int)
    per_page = 50
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    with log_lock:
        logs_page = request_logs[start_idx:end_idx]
        total_pages = (len(request_logs) + per_page - 1) // per_page
    
    return render_template('logs.html', 
                         logs=logs_page, 
                         page=page, 
                         total_pages=total_pages,
                         total_requests=len(request_logs))

@app.route('/api/logs')
@rate_limit
def api_logs():
    """API endpoint for logs"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    with log_lock:
        logs_page = request_logs[start_idx:end_idx]
    
    return jsonify({
        'logs': logs_page,
        'page': page,
        'per_page': per_page,
        'total': len(request_logs)
    })

@app.route('/files/<filename>')
@rate_limit
def serve_file(filename):
    """Serve a file from the uploads directory for viewing/execution"""
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return "File not found", 404
        
        # Determine content type based on file extension
        content_type = get_content_type(filename)
        
        # For HTML files, serve with HTML content type
        if filename.lower().endswith('.html'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/html'}
        
        # For JavaScript files, serve with JS content type
        elif filename.lower().endswith('.js'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/javascript'}
        
        # For CSS files, serve with CSS content type
        elif filename.lower().endswith('.css'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/css'}
        
        # For PHP files, serve with PHP content type (if server supports it)
        elif filename.lower().endswith('.php'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'application/x-httpd-php'}
        
        # For text files, serve as text
        elif filename.lower().endswith(('.txt', '.log', '.md', '.py', '.sh', '.bat', '.ps1')):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return content, 200, {'Content-Type': 'text/plain'}
        
        # For other files, serve with appropriate content type
        else:
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
            
    except Exception as e:
        logging.error(f"Error serving file {filename}: {e}")
        return "File not found", 404

def get_content_type(filename):
    """Get appropriate content type for file extension"""
    content_types = {
        '.html': 'text/html',
        '.htm': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.php': 'application/x-httpd-php',
        '.txt': 'text/plain',
        '.log': 'text/plain',
        '.md': 'text/plain',
        '.py': 'text/plain',
        '.sh': 'text/plain',
        '.bat': 'text/plain',
        '.ps1': 'text/plain',
        '.xml': 'application/xml',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip'
    }
    
    ext = os.path.splitext(filename.lower())[1]
    return content_types.get(ext, 'application/octet-stream')

@app.route('/upload', methods=['GET', 'POST'])
@rate_limit
def upload_file():
    """Upload a file"""
    if request.method == 'POST':
        if 'file' not in request.files:
            return "No file selected", 400
        
        file = request.files['file']
        if file.filename == '':
            return "No file selected", 400
        
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            logging.info(f"File uploaded: {filename}")
            return f"File {filename} uploaded successfully"
    
    return render_template('upload.html')

@app.route('/clear-logs', methods=['POST'])
@rate_limit
def clear_logs():
    """Clear all request logs"""
    with log_lock:
        request_logs.clear()
        try:
            with open(app.config['LOGS_FILE'], 'w') as f:
                json.dump([], f)
        except Exception as e:
            logging.error(f"Failed to clear logs file: {e}")
    
    logging.info("Request logs cleared")
    return "Logs cleared successfully"

@app.route('/webhook', methods=['POST'])
def webhook_test():
    """Test webhook endpoint"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    logging.info(f"Webhook test received: {data}")
    return jsonify({'status': 'webhook received', 'data': data})

@app.route('/api/stats')
@rate_limit
def api_stats():
    """API endpoint for server statistics"""
    with log_lock:
        total_requests = len(request_logs)
        
        # Calculate request methods distribution
        methods = {}
        for log in request_logs:
            method = log['method']
            methods[method] = methods.get(method, 0) + 1
        
        # Calculate recent activity (last hour)
        one_hour_ago = datetime.datetime.now() - datetime.timedelta(hours=1)
        recent_requests = sum(1 for log in request_logs 
                            if datetime.datetime.fromisoformat(log['timestamp']) > one_hour_ago)
        
        # Get unique IPs
        unique_ips = len(set(log['remote_addr'] for log in request_logs))
    
    return jsonify({
        'total_requests': total_requests,
        'recent_requests': recent_requests,
        'unique_ips': unique_ips,
        'methods': methods,
        'uptime': datetime.datetime.now().isoformat()
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'request_count': len(request_logs),
        'version': '1.0.0'
    })

@app.route('/robots.txt')
def robots_txt():
    """Robots.txt file to discourage crawling"""
    return """User-agent: *
Disallow: /
# This is a pentesting lab server - please do not crawl""", 200, {'Content-Type': 'text/plain'}

@app.errorhandler(404)
def not_found(error):
    """Custom 404 handler"""
    return jsonify({'error': 'Not found', 'path': request.path}), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Rate limit exceeded handler"""
    return jsonify({'error': 'Rate limit exceeded', 'retry_after': 60}), 429

if __name__ == '__main__':
    # Load existing logs if available
    try:
        if os.path.exists(app.config['LOGS_FILE']):
            with open(app.config['LOGS_FILE'], 'r') as f:
                request_logs.extend(json.load(f))
            logging.info(f"Loaded {len(request_logs)} existing log entries")
    except Exception as e:
        logging.error(f"Failed to load existing logs: {e}")
    
    app.run(host='0.0.0.0', port=8080, debug=False)

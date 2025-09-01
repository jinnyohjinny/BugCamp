import http.server
import socketserver
import os
from urllib.parse import urlparse, parse_qs

class InternalServiceHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/flag':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            
            service_key = os.environ.get('SERVICE_KEY', 'flag{default_internal_key}')
            response_content = f"{service_key}\n"
            self.wfile.write(response_content.encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def log_message(self, format, *args):
        pass

def run_service():
    PORT = 1234
    
    with socketserver.TCPServer(("", PORT), InternalServiceHandler) as httpd:
        print(f"Internal service running on port {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    run_service()
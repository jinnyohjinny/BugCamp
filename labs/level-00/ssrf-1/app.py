from flask import Flask, request, render_template_string, jsonify
import requests
import urllib.parse

app = Flask(__name__)
app.secret_key = 'ssrf-lab-secret-key-production'

HOME_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asset Loader</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #34495e;
        }
        input[type="url"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e6ed;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input[type="url"]:focus {
            outline: none;
            border-color: #3498db;
        }
        .btn {
            background: #3498db;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #2980b9;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        .error {
            background: #fdf2f2;
            border-left-color: #e74c3c;
            color: #c0392b;
        }
        .content {
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 400px;
            overflow-y: auto;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .example {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .example h3 {
            margin-top: 0;
            color: #2980b9;
        }
        .example code {
            background: #34495e;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Asset Loader Service</h1>
        <p>Enter a URL to fetch external assets for your application. This service supports HTTP and HTTPS protocols.</p>
        
        <div class="example">
            <h3>Example Usage:</h3>
            <p>Load CSS stylesheets: <code>https://cdn.example.com/styles.css</code></p>
            <p>Fetch JSON data: <code>https://api.example.com/data.json</code></p>
            <p>Download images: <code>https://images.example.com/logo.png</code></p>
        </div>

        <form method="POST" action="/fetch">
            <div class="form-group">
                <label for="url">Asset URL:</label>
                <input type="url" id="url" name="url" required placeholder="https://cdn.example.com/asset.css">
            </div>
            <button type="submit" class="btn">Load Asset</button>
        </form>

        {% if result %}
        <div class="result {{ 'error' if error else '' }}">
            <h3>{{ 'Error' if error else 'Asset Content' }}</h3>
            <div class="content">{{ result }}</div>
        </div>
        {% endif %}
    </div>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HOME_TEMPLATE)

@app.route('/fetch', methods=['POST'])
def fetch_asset():
    url = request.form.get('url', '').strip()
    
    if not url:
        return render_template_string(HOME_TEMPLATE, result="URL is required", error=True)
    
    try:
        parsed_url = urllib.parse.urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return render_template_string(HOME_TEMPLATE, result="Invalid URL format", error=True)
        
        response = requests.get(url, timeout=10, allow_redirects=True)
        response.raise_for_status()
        
        content = response.text
        if len(content) > 10000:
            content = content[:10000] + "\n... (content truncated)"
        
        return render_template_string(HOME_TEMPLATE, result=content)
    
    except requests.exceptions.Timeout:
        return render_template_string(HOME_TEMPLATE, result="Request timeout - the server took too long to respond", error=True)
    except requests.exceptions.ConnectionError:
        return render_template_string(HOME_TEMPLATE, result="Connection failed - unable to reach the specified URL", error=True)
    except requests.exceptions.HTTPError as e:
        return render_template_string(HOME_TEMPLATE, result=f"HTTP Error {e.response.status_code}: {e.response.reason}", error=True)
    except Exception as e:
        return render_template_string(HOME_TEMPLATE, result=f"Unexpected error: {str(e)}", error=True)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "asset-loader"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
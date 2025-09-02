from flask import Flask, request, render_template_string, jsonify
import subprocess
import os

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Network Connectivity Checker</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
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
            color: #555;
        }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: #3498db;
        }
        .btn {
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
        }
        .result pre {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        .error {
            border-left-color: #e74c3c;
            background-color: #fdf2f2;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Network Connectivity Checker</h1>
        <form method="POST" action="/">
            <div class="form-group">
                <label for="ip">IP Address or Hostname:</label>
                <input type="text" id="ip" name="ip" value="{{ ip_value if ip_value else '127.0.0.1' }}" placeholder="Enter IP address (e.g., 8.8.8.8)" required>
            </div>
            <button type="submit" class="btn">Test Connectivity</button>
        </form>
        
        {% if result %}
        <div class="result{% if error %} error{% endif %}">
            <h3>{% if error %}Error{% else %}Results{% endif %}</h3>
            <pre>{{ result }}</pre>
        </div>
        {% endif %}
    </div>
    <div class="footer">
        Professional Network Diagnostics Tool v2.1
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def ping_test():
    if request.method == 'GET':
        return render_template_string(HTML_TEMPLATE)
    
    ip = request.form.get('ip', '').strip()
    if not ip:
        return render_template_string(HTML_TEMPLATE, result="Please provide an IP address", error=True, ip_value=ip)
    
    try:
        command = f"ping -c 2 {ip}"
        result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, text=True, timeout=10)
        return render_template_string(HTML_TEMPLATE, result=result, error=False, ip_value=ip)
    except subprocess.CalledProcessError as e:
        return render_template_string(HTML_TEMPLATE, result=e.output, error=True, ip_value=ip)
    except subprocess.TimeoutExpired:
        return render_template_string(HTML_TEMPLATE, result="Request timed out", error=True, ip_value=ip)
    except Exception as e:
        return render_template_string(HTML_TEMPLATE, result=f"An error occurred: {str(e)}", error=True, ip_value=ip)

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
from flask import Flask, request, render_template_string, redirect, url_for, jsonify, make_response
import jwt
import base64
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Secret key for JWT signing (same for both session and key access)
JWT_SECRET = "supersecretkey123"

# In-memory storage for keys
keys = {
    0: {"id": 0, "name": "admin_secret", "value": "FLAG{signing_oracle_admin_access_achieved}"},
    1: {"id": 1, "name": "demo_key", "value": "demo_value_123"}
}

# User data
users = {
    "demo": {"id": 1, "username": "demo", "password": "pentesterlab"},
    "user1": {"id": 2, "username": "user1", "password": "pentesterlab"},
    "user2": {"id": 3, "username": "user2", "password": "pentesterlab"},
    "0": {"id": 0, "username": "0", "password": "pentesterlab"}
}

def get_next_user_id():
    """Get the next available user ID"""
    if not users:
        return 1
    return max(user['id'] for user in users.values()) + 1

def create_session_jwt(user_id, username):
    """Create JWT for session management"""
    payload = {
        "id": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def create_key_access_jwt(key_id):
    """Create JWT for key access"""
    payload = {
        "id": key_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_jwt(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/')
def index():
    session_token = request.cookies.get('session')
    if not session_token:
        return redirect(url_for('login'))
    
    payload = verify_jwt(session_token)
    if not payload:
        return redirect(url_for('login'))
    
    user_keys = []
    for key_id, key_data in keys.items():
        if key_id != 0:  # Hide admin key from regular users
            access_token = create_key_access_jwt(key_id)
            user_keys.append({
                'id': key_id,
                'name': key_data['name'],
                'access_url': f"/key/{access_token}"
            })
    
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Secure Key Management</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .key-item { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; }
        .btn:hover { background: #0056b3; }
        .logout { float: right; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Secure Key Management System</h1>
        <p>Welcome, {{ username }}!</p>
        <a href="/logout" class="btn logout">Logout</a>
        
        <h2>Your Keys</h2>
        {% if user_keys %}
            {% for key in user_keys %}
            <div class="key-item">
                <strong>{{ key.name }}</strong> (ID: {{ key.id }})
                <br>
                <a href="{{ key.access_url }}" class="btn">Access Key</a>
            </div>
            {% endfor %}
        {% else %}
            <p>No keys available.</p>
        {% endif %}
        
        <h2>Add New Key</h2>
        <form method="POST" action="/add_key">
            <input type="text" name="key_name" placeholder="Key name" required>
            <input type="text" name="key_value" placeholder="Key value" required>
            <button type="submit" class="btn">Add Key</button>
        </form>
    </div>
</body>
</html>
    ''', username=payload['username'], user_keys=user_keys)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Block admin login
        if username == 'admin':
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enterprise Portal</h1>
        <div class="error">Invalid username or password</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" class="btn">Login</button>
        </form>
    </div>
</body>
</html>
            ''')
        
        # Check user credentials
        user = users.get(username)
        if user and user['password'] == password:
            token = create_session_jwt(user['id'], user['username'])
            response = make_response(redirect(url_for('index')))
            response.set_cookie('session', token, httponly=True)
            return response
        else:
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enterprise Portal</h1>
        <div class="error">Invalid username or password</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" class="btn">Login</button>
        </form>
    </div>
</body>
</html>
            ''')
    
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .btn-secondary { background: #6c757d; margin-top: 10px; }
        .btn-secondary:hover { background: #5a6268; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enterprise Portal</h1>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit" class="btn">Login</button>
        </form>
        <div class="text-center">
            <p>Don't have an account? <a href="/register">Register here</a></p>
        </div>
    </div>
</body>
</html>
    ''')

@app.route('/logout')
def logout():
    response = make_response(redirect(url_for('login')))
    response.set_cookie('session', '', expires=0)
    return response

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not username or not password or not confirm_password:
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Account</h1>
        <div class="error">All fields are required</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            <button type="submit" class="btn">Register</button>
        </form>
        <div class="text-center">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    </div>
</body>
</html>
            ''')
        
        if password != confirm_password:
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Account</h1>
        <div class="error">Passwords do not match</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            <button type="submit" class="btn">Register</button>
        </form>
        <div class="text-center">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    </div>
</body>
</html>
            ''')
        
        # Check if username already exists
        if username in users:
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Account</h1>
        <div class="error">Username already exists</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            <button type="submit" class="btn">Register</button>
        </form>
        <div class="text-center">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    </div>
</body>
</html>
            ''')
        
        # Block admin username
        if username.lower() == 'admin':
            return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Account</h1>
        <div class="error">Username not available</div>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            <button type="submit" class="btn">Register</button>
        </form>
        <div class="text-center">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    </div>
</body>
</html>
            ''')
        
        # Create new user
        new_user_id = get_next_user_id()
        users[username] = {
            'id': new_user_id,
            'username': username,
            'password': password
        }
        
        # Auto-login the new user
        token = create_session_jwt(new_user_id, username)
        response = make_response(redirect(url_for('index')))
        response.set_cookie('session', token, httponly=True)
        return response
    
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Register</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 400px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 5px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 3px; width: 100%; }
        .text-center { text-align: center; margin-top: 15px; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create Account</h1>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required>
            <button type="submit" class="btn">Register</button>
        </form>
        <div class="text-center">
            <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
    </div>
</body>
</html>
    ''')

@app.route('/add_key', methods=['POST'])
def add_key():
    session_token = request.cookies.get('session')
    if not session_token:
        return redirect(url_for('login'))
    
    payload = verify_jwt(session_token)
    if not payload:
        return redirect(url_for('login'))
    
    key_name = request.form.get('key_name')
    key_value = request.form.get('key_value')
    
    if key_name and key_value:
        new_key_id = max(keys.keys()) + 1 if keys else 1
        keys[new_key_id] = {
            'id': new_key_id,
            'name': key_name,
            'value': key_value
        }
    
    return redirect(url_for('index'))

@app.route('/key/<token>')
def access_key(token):
    payload = verify_jwt(token)
    if not payload:
        return "Invalid or expired token", 403
    
    key_id = payload.get('id')
    key_data = keys.get(key_id)
    
    if not key_data:
        return "Key not found", 404
    
    return render_template_string('''
<!DOCTYPE html>
<html>
<head>
    <title>Key Access</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 600px; margin: 0 auto; }
        .key-value { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; }
        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Key Details</h1>
        <p><strong>Key ID:</strong> {{ key_id }}</p>
        <p><strong>Key Name:</strong> {{ key_name }}</p>
        <div class="key-value">
            <strong>Value:</strong> {{ key_value }}
        </div>
        <br>
        <a href="/" class="btn">Back to Dashboard</a>
    </div>
</body>
</html>
    ''', key_id=key_data['id'], key_name=key_data['name'], key_value=key_data['value'])

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
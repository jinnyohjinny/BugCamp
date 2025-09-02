#!/usr/bin/env python3

from flask import Flask, request, render_template_string, redirect, url_for, session, make_response
import sqlite3
import hashlib
import base64
import urllib.parse
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
app.secret_key = 'secret-key-for-session-management'

def init_db():
    conn = sqlite3.connect('idp.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    admin_password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password_hash, email)
        VALUES (?, ?, ?)
    ''', ('admin@example.so', admin_password_hash, 'admin@example.so'))
    
    conn.commit()
    conn.close()

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    
    login_form = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enterprise Identity Provider</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { color: #333; text-align: center; margin-bottom: 30px; }
            input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { width: 100%; background: #007cba; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #005c8a; }
            .link { text-align: center; margin-top: 15px; }
            .link a { color: #007cba; text-decoration: none; }
            .error { color: red; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Enterprise Identity Provider</h2>
            {% if error %}
                <div class="error">{{ error }}</div>
            {% endif %}
            <form method="POST" action="/login">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Sign In</button>
            </form>
            <div class="link">
                <a href="/register">Create Account</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(login_form, error=request.args.get('error'))

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    conn = sqlite3.connect('idp.db')
    cursor = conn.cursor()
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute('SELECT id FROM users WHERE username = ? AND password_hash = ?', 
                  (username, password_hash))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user[0]
        session['username'] = username
        return redirect(url_for('dashboard'))
    else:
        return redirect(url_for('index', error='Invalid credentials'))

@app.route('/register')
def register_form():
    register_html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Create Account - Enterprise Identity Provider</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { color: #333; text-align: center; margin-bottom: 30px; }
            input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
            button { width: 100%; background: #007cba; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #005c8a; }
            .link { text-align: center; margin-top: 15px; }
            .link a { color: #007cba; text-decoration: none; }
            .error { color: red; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Create Account</h2>
            {% if error %}
                <div class="error">{{ error }}</div>
            {% endif %}
            <form method="POST" action="/register">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="email" name="email" placeholder="Email" required>
                <button type="submit">Register</button>
            </form>
            <div class="link">
                <a href="/">Back to Login</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(register_html, error=request.args.get('error'))

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    
    conn = sqlite3.connect('idp.db')
    cursor = conn.cursor()
    
    try:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                      (username, password_hash, email))
        conn.commit()
        conn.close()
        
        return redirect(url_for('index'))
    except sqlite3.IntegrityError:
        conn.close()
        return redirect(url_for('register_form', error='User already exists'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    dashboard_html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard - Enterprise Identity Provider</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { color: #333; margin-bottom: 20px; }
            .info { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .logout { float: right; background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; text-decoration: none; }
            .logout:hover { background: #c82333; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Identity Provider Dashboard
                <a href="/logout" class="logout">Logout</a>
            </h2>
            <div class="info">
                <strong>Welcome, {{ username }}</strong><br>
                You are successfully authenticated with the Enterprise Identity Provider.
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(dashboard_html, username=session.get('username'))

@app.route('/sso')
def sso():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    saml_request = request.args.get('SAMLRequest', '')
    relay_state = request.args.get('RelayState', '')
    
    username = session.get('username')
    
    issue_instant = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3] + 'Z'
    not_on_or_after = (datetime.utcnow() + timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3] + 'Z'
    response_id = '_' + str(uuid.uuid4())
    assertion_id = '_' + str(uuid.uuid4())
    
    saml_response = f'''<saml2p:Response ID="{response_id}" IssueInstant="{issue_instant}" Version="2.0" xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://idp:5001</saml2:Issuer>
    <saml2p:Status>
        <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </saml2p:Status>
    <saml2:Assertion ID="{assertion_id}" IssueInstant="{issue_instant}" Version="2.0" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml2:Issuer>http://idp:5001</saml2:Issuer>
        <saml2:Subject>
            <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">{username}</saml2:NameID>
            <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml2:SubjectConfirmationData NotOnOrAfter="{not_on_or_after}" Recipient="http://sp:5002/consume"/>
            </saml2:SubjectConfirmation>
        </saml2:Subject>
        <saml2:Conditions NotBefore="{issue_instant}" NotOnOrAfter="{not_on_or_after}">
            <saml2:AudienceRestriction>
                <saml2:Audience>http://sp:5002</saml2:Audience>
            </saml2:AudienceRestriction>
        </saml2:Conditions>
        <saml2:AuthnStatement AuthnInstant="{issue_instant}">
            <saml2:AuthnContext>
                <saml2:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml2:AuthnContextClassRef>
            </saml2:AuthnContext>
        </saml2:AuthnStatement>
        <saml2:AttributeStatement>
            <saml2:Attribute Name="email">
                <saml2:AttributeValue>{username}</saml2:AttributeValue>
            </saml2:Attribute>
        </saml2:AttributeStatement>
    </saml2:Assertion>
</saml2p:Response>'''
    
    encoded_response = base64.b64encode(saml_response.encode()).decode()
    
    post_form = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redirecting...</title>
    </head>
    <body>
        <form id="samlform" method="POST" action="http://sp:5002/consume">
            <input type="hidden" name="SAMLResponse" value="{encoded_response}" />
            <input type="hidden" name="RelayState" value="{relay_state}" />
        </form>
        <script>
            document.getElementById('samlform').submit();
        </script>
    </body>
    </html>
    '''
    
    return post_form

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=False)
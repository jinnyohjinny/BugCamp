#!/usr/bin/env python3

from flask import Flask, request, render_template_string, redirect, url_for, session
import sqlite3
import hashlib
import base64
import xml.etree.ElementTree as ET
import urllib.parse
from datetime import datetime, timedelta
import uuid
import threading

app = Flask(__name__)
app.secret_key = 'unified-saml-app-secret-key'

def init_db():
    conn = sqlite3.connect('saml.db')
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
    landing_page = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enterprise Platform</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            .service { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa; }
            .service h3 { color: #555; margin-top: 0; }
            .service a { background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
            .service a:hover { background: #005c8a; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Enterprise Platform</h1>
            <div class="service">
                <h3>Identity Provider</h3>
                <p>Manage user accounts and authentication services.</p>
                <a href="/idp/">Access Identity Provider</a>
            </div>
            <div class="service">
                <h3>Service Provider</h3>
                <p>Access enterprise applications and services through single sign-on.</p>
                <a href="/sp/">Access Service Provider</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return landing_page

@app.route('/idp/')
def idp_index():
    if 'idp_user_id' in session:
        return redirect(url_for('idp_dashboard'))
    
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
            .back { text-align: center; margin-bottom: 20px; }
            .back a { color: #666; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back"><a href="/">← Back to Platform</a></div>
            <h2>Enterprise Identity Provider</h2>
            {% if error %}
                <div class="error">{{ error }}</div>
            {% endif %}
            <form method="POST" action="/idp/login">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Sign In</button>
            </form>
            <div class="link">
                <a href="/idp/register">Create Account</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(login_form, error=request.args.get('error'))

@app.route('/idp/login', methods=['POST'])
def idp_login():
    username = request.form['username']
    password = request.form['password']
    
    conn = sqlite3.connect('saml.db')
    cursor = conn.cursor()
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute('SELECT id FROM users WHERE username = ? AND password_hash = ?', 
                  (username, password_hash))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        session['idp_user_id'] = user[0]
        session['idp_username'] = username
        return redirect(url_for('idp_dashboard'))
    else:
        return redirect(url_for('idp_index', error='Invalid credentials'))

@app.route('/idp/register')
def idp_register_form():
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
            .back { text-align: center; margin-bottom: 20px; }
            .back a { color: #666; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back"><a href="/idp/">← Back to Login</a></div>
            <h2>Create Account</h2>
            {% if error %}
                <div class="error">{{ error }}</div>
            {% endif %}
            <form method="POST" action="/idp/register">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="email" name="email" placeholder="Email" required>
                <button type="submit">Register</button>
            </form>
            <div class="link">
                <a href="/idp/">Back to Login</a>
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(register_html, error=request.args.get('error'))

@app.route('/idp/register', methods=['POST'])
def idp_register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    
    conn = sqlite3.connect('saml.db')
    cursor = conn.cursor()
    
    try:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        cursor.execute('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                      (username, password_hash, email))
        conn.commit()
        conn.close()
        
        return redirect(url_for('idp_index'))
    except sqlite3.IntegrityError:
        conn.close()
        return redirect(url_for('idp_register_form', error='User already exists'))

@app.route('/idp/dashboard')
def idp_dashboard():
    if 'idp_user_id' not in session:
        return redirect(url_for('idp_index'))
    
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
            .back { text-align: center; margin-bottom: 20px; }
            .back a { color: #666; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back"><a href="/">← Back to Platform</a></div>
            <h2>Identity Provider Dashboard
                <a href="/idp/logout" class="logout">Logout</a>
            </h2>
            <div class="info">
                <strong>Welcome, {{ username }}</strong><br>
                You are successfully authenticated with the Enterprise Identity Provider.
            </div>
        </div>
    </body>
    </html>
    '''
    return render_template_string(dashboard_html, username=session.get('idp_username'))

@app.route('/idp/sso')
def idp_sso():
    if 'idp_user_id' not in session:
        return redirect(url_for('idp_index'))
    
    saml_request = request.args.get('SAMLRequest', '')
    relay_state = request.args.get('RelayState', '')
    
    username = session.get('idp_username')
    
    issue_instant = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3] + 'Z'
    not_on_or_after = (datetime.utcnow() + timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3] + 'Z'
    response_id = '_' + str(uuid.uuid4())
    assertion_id = '_' + str(uuid.uuid4())
    
    saml_response = f'''<saml2p:Response ID="{response_id}" IssueInstant="{issue_instant}" Version="2.0" xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://localhost:9051/idp</saml2:Issuer>
    <saml2p:Status>
        <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </saml2p:Status>
    <saml2:Assertion ID="{assertion_id}" IssueInstant="{issue_instant}" Version="2.0" xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml2:Issuer>http://localhost:9051/idp</saml2:Issuer>
        <saml2:Subject>
            <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">{username}</saml2:NameID>
            <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml2:SubjectConfirmationData NotOnOrAfter="{not_on_or_after}" Recipient="http://localhost:9051/sp/consume"/>
            </saml2:SubjectConfirmation>
        </saml2:Subject>
        <saml2:Conditions NotBefore="{issue_instant}" NotOnOrAfter="{not_on_or_after}">
            <saml2:AudienceRestriction>
                <saml2:Audience>http://localhost:9051/sp</saml2:Audience>
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
        <form id="samlform" method="POST" action="/sp/consume">
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

@app.route('/idp/logout')
def idp_logout():
    for key in list(session.keys()):
        if key.startswith('idp_'):
            session.pop(key)
    return redirect(url_for('idp_index'))

@app.route('/sp/')
def sp_index():
    if 'sp_saml_user' in session:
        return redirect(url_for('sp_dashboard'))
    
    landing_page = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Enterprise Service Portal</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            .login-button { display: block; width: 200px; margin: 20px auto; background: #007cba; color: white; padding: 15px; text-align: center; text-decoration: none; border-radius: 4px; }
            .login-button:hover { background: #005c8a; }
            .info { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .back { text-align: center; margin-bottom: 20px; }
            .back a { color: #666; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back"><a href="/">← Back to Platform</a></div>
            <h1>Enterprise Service Portal</h1>
            <div class="info">
                Welcome to the Enterprise Service Portal. This platform provides secure access to corporate resources through single sign-on authentication.
            </div>
            <a href="/sp/saml/login" class="login-button">Login with SAML</a>
        </div>
    </body>
    </html>
    '''
    return landing_page

@app.route('/sp/saml/login')
def sp_saml_login():
    relay_state = request.args.get('RelayState', '')
    
    saml_request = f'''<saml2p:AuthnRequest ID="_{str(uuid.uuid4())}" 
                        IssueInstant="{datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3]}Z" 
                        Version="2.0" 
                        xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://localhost:9051/sp</saml2:Issuer>
    </saml2p:AuthnRequest>'''
    
    encoded_request = base64.b64encode(saml_request.encode()).decode()
    sso_url = f"/idp/sso?SAMLRequest={urllib.parse.quote(encoded_request)}&RelayState={urllib.parse.quote(relay_state)}"
    
    return redirect(sso_url)

@app.route('/sp/consume', methods=['POST'])
def sp_consume():
    saml_response = request.form.get('SAMLResponse', '')
    relay_state = request.form.get('RelayState', '')
    
    try:
        decoded_response = base64.b64decode(saml_response).decode('utf-8')
        
        root = ET.fromstring(decoded_response)
        
        ns = {
            'saml2p': 'urn:oasis:names:tc:SAML:2.0:protocol',
            'saml2': 'urn:oasis:names:tc:SAML:2.0:assertion'
        }
        
        status_elem = root.find('.//saml2p:Status/saml2p:StatusCode', ns)
        if status_elem is not None and status_elem.get('Value') != 'urn:oasis:names:tc:SAML:2.0:status:Success':
            return "Authentication failed", 400
        
        nameid_elem = root.find('.//saml2:NameID', ns)
        if nameid_elem is not None:
            username = nameid_elem.text
            session['sp_saml_user'] = username
            
            if username == 'admin@example.so':
                session['sp_is_admin'] = True
                session['sp_flag'] = 'DEMOKEY-DEMOKEY-DEMOKEY'
            
            return redirect(url_for('sp_dashboard'))
        else:
            return "No user information found in SAML response", 400
    
    except Exception as e:
        return f"Error processing SAML response: {str(e)}", 400

@app.route('/sp/dashboard')
def sp_dashboard():
    if 'sp_saml_user' not in session:
        return redirect(url_for('sp_index'))
    
    username = session.get('sp_saml_user')
    is_admin = session.get('sp_is_admin', False)
    flag = session.get('sp_flag', '')
    
    if is_admin:
        dashboard_content = f'''
        <div class="admin-section">
            <h3>Administrative Access</h3>
            <div class="success">
                Welcome {username}! You have administrative privileges.
            </div>
            <div class="flag">
                <strong>Flag:</strong> {flag}
            </div>
        </div>
        '''
    else:
        dashboard_content = f'''
        <div class="user-section">
            <h3>User Access</h3>
            <div class="info">
                Welcome {username}! You have standard user privileges.
            </div>
        </div>
        '''
    
    dashboard_html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard - Enterprise Service Portal</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            h2 {{ color: #333; margin-bottom: 20px; }}
            h3 {{ color: #555; }}
            .info {{ background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 4px; margin: 15px 0; }}
            .success {{ background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 15px 0; color: #155724; }}
            .flag {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; color: #856404; font-family: monospace; }}
            .logout {{ float: right; background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; text-decoration: none; }}
            .logout:hover {{ background: #c82333; }}
            .back {{ text-align: center; margin-bottom: 20px; }}
            .back a {{ color: #666; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="back"><a href="/">← Back to Platform</a></div>
            <h2>Service Portal Dashboard
                <a href="/sp/logout" class="logout">Logout</a>
            </h2>
            {dashboard_content}
        </div>
    </body>
    </html>
    '''
    return dashboard_html

@app.route('/sp/logout')
def sp_logout():
    for key in list(session.keys()):
        if key.startswith('sp_'):
            session.pop(key)
    return redirect(url_for('sp_index'))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=80, debug=False)
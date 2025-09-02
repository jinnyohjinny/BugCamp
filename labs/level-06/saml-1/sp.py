#!/usr/bin/env python3

from flask import Flask, request, render_template_string, redirect, url_for, session, make_response
import base64
import xml.etree.ElementTree as ET
import urllib.parse
import uuid
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'service-provider-secret-key'

@app.route('/')
def index():
    if 'saml_user' in session:
        return redirect(url_for('dashboard'))
    
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
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Enterprise Service Portal</h1>
            <div class="info">
                Welcome to the Enterprise Service Portal. This platform provides secure access to corporate resources through single sign-on authentication.
            </div>
            <a href="/saml/login" class="login-button">Login with SAML</a>
        </div>
    </body>
    </html>
    '''
    return landing_page

@app.route('/saml/login')
def saml_login():
    relay_state = request.args.get('RelayState', '')
    
    saml_request = f'''<saml2p:AuthnRequest ID="_{str(uuid.uuid4())}" 
                        IssueInstant="{datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-3]}Z" 
                        Version="2.0" 
                        xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://sp:5002</saml2:Issuer>
    </saml2p:AuthnRequest>'''
    
    encoded_request = base64.b64encode(saml_request.encode()).decode()
    sso_url = f"http://idp:5001/sso?SAMLRequest={urllib.parse.quote(encoded_request)}&RelayState={urllib.parse.quote(relay_state)}"
    
    return redirect(sso_url)

@app.route('/consume', methods=['POST'])
def consume():
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
            session['saml_user'] = username
            
            if username == 'admin@example.so':
                session['is_admin'] = True
                session['flag'] = 'DEMOKEY-DEMOKEY-DEMOKEY'
            
            return redirect(url_for('dashboard'))
        else:
            return "No user information found in SAML response", 400
    
    except Exception as e:
        return f"Error processing SAML response: {str(e)}", 400

@app.route('/dashboard')
def dashboard():
    if 'saml_user' not in session:
        return redirect(url_for('index'))
    
    username = session.get('saml_user')
    is_admin = session.get('is_admin', False)
    flag = session.get('flag', '')
    
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
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Service Portal Dashboard
                <a href="/logout" class="logout">Logout</a>
            </h2>
            {dashboard_content}
        </div>
    </body>
    </html>
    '''
    return dashboard_html

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
#!/usr/bin/env python3
import os
import pickle
import base64
import hashlib
import secrets
from flask import Flask, request, render_template, redirect, url_for, make_response, session, flash
from functools import wraps

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# In-memory user storage
users = {}
sessions = {}

def generate_session_id():
    return secrets.token_hex(16)

def create_remember_me_cookie(username):
    user_data = {
        'username': username,
        'role': users[username]['role']
    }
    pickled_data = pickle.dumps(user_data)
    return base64.b64encode(pickled_data).decode('utf-8')

def load_remember_me_cookie(cookie_value):
    try:
        pickled_data = base64.b64decode(cookie_value.encode('utf-8'))
        return pickle.loads(pickled_data)
    except:
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            remember_me = request.cookies.get('remember_me')
            if remember_me:
                user_data = load_remember_me_cookie(remember_me)
                if user_data and user_data['username'] in users:
                    session['user_id'] = user_data['username']
                    session['role'] = user_data['role']
                else:
                    return redirect(url_for('login'))
            else:
                return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Please fill in all fields')
            return render_template('register.html')
        
        if username in users:
            flash('Username already exists')
            return render_template('register.html')
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        users[username] = {
            'password_hash': password_hash,
            'role': 'user'
        }
        
        flash('Registration successful! Please log in.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        
        if not username or not password:
            flash('Please fill in all fields')
            return render_template('login.html')
        
        if username not in users:
            flash('Invalid username or password')
            return render_template('login.html')
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if users[username]['password_hash'] != password_hash:
            flash('Invalid username or password')
            return render_template('login.html')
        
        session['user_id'] = username
        session['role'] = users[username]['role']
        
        response = make_response(redirect(url_for('dashboard')))
        
        if remember_me:
            remember_cookie = create_remember_me_cookie(username)
            response.set_cookie('remember_me', remember_cookie, max_age=30*24*60*60)
        
        return response
    
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    username = session['user_id']
    role = session['role']
    return render_template('dashboard.html', username=username, role=role)

@app.route('/logout')
def logout():
    session.clear()
    response = make_response(redirect(url_for('login')))
    response.delete_cookie('remember_me')
    return response

@app.route('/score')
def score():
    return "Challenge completed successfully!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

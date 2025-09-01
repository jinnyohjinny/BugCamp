#!/usr/bin/env python3
from flask import Flask, render_template, request, make_response, redirect, url_for
import hashlib
import os
import json

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'default-secret-key-change-in-production')

# In-memory user database
users = {}
FLAG = "FLAG{cookie_tampering_is_sweet_as_sugar}"

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_from_cookie(cookie_value):
    if not cookie_value:
        return None
    return cookie_value

@app.route('/')
def index():
    user = get_user_from_cookie(request.cookies.get('auth'))
    if user:
        if user == 'admin':
            return render_template('dashboard.html', user=user, flag=FLAG)
        return render_template('dashboard.html', user=user, flag=None)
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        if not username or not password:
            return render_template('register.html', error='Username and password are required')
        
        if username in users:
            return render_template('register.html', error='Username already exists')
        
        if username == 'admin':
            return render_template('register.html', error='Username not available')
        
        users[username] = hash_password(password)
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        if not username or not password:
            return render_template('login.html', error='Username and password are required')
        
        if username == 'admin':
            admin_password = os.environ.get('ADMIN_PASSWORD', 'supersecret123')
            if password == admin_password:
                resp = make_response(redirect(url_for('index')))
                resp.set_cookie('auth', username, httponly=True)
                return resp
            else:
                return render_template('login.html', error='Invalid credentials')
        
        if username in users and users[username] == hash_password(password):
            resp = make_response(redirect(url_for('index')))
            resp.set_cookie('auth', username, httponly=True)
            return resp
        
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    resp = make_response(redirect(url_for('index')))
    resp.set_cookie('auth', '', expires=0)
    return resp

@app.route('/profile')
def profile():
    user = get_user_from_cookie(request.cookies.get('auth'))
    if not user:
        return redirect(url_for('login'))
    
    return render_template('profile.html', user=user)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
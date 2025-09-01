from flask import Flask, render_template, request, session, redirect, url_for, flash
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'fallback-key')

# User credentials - start with demo user
USERS = {
    'User1': 'testpassword'
}

# Info data - some visible, some hidden
INFO_DATA = {
    1: {'title': 'Getting Started', 'content': 'Welcome to our platform! Here you can access various information pages.'},
    2: {'title': 'User Guide', 'content': 'This guide will help you navigate through the application features.'},
    3: {'title': 'Secret Information', 'content': 'DEMOKEY DEMOKEY DEMOKEY'}
}

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in USERS and USERS[username] == password:
            session['username'] = username
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', username=session['username'])

@app.route('/infos/<int:info_id>')
def info_page(info_id):
    if 'username' not in session:
        return redirect(url_for('login'))
    
    info = INFO_DATA.get(info_id)
    if info:
        return render_template('info.html', info=info, info_id=info_id)
    else:
        return render_template('404.html'), 404

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        # Basic validation
        if not username or not password:
            flash('Username and password are required', 'error')
            return render_template('register.html')
            
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('register.html')
            
        if username in USERS:
            flash('Username already exists', 'error')
            return render_template('register.html')
            
        # Add new user
        USERS[username] = password
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Logged out successfully!', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
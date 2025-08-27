#!/usr/bin/env python3
"""
Secure User Profile System
A professional web application for managing user profiles and preferences.
"""

import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# In-memory storage for demo purposes
user_profiles = {
    'default': {
        'name': 'John Doe',
        'role': 'Software Engineer',
        'department': 'Engineering',
        'last_updated': '2024-01-15'
    }
}

@app.route('/')
def index():
    """Main landing page with navigation to user profiles."""
    return render_template('index.html')

@app.route('/profile')
def profile():
    """User profile page that displays user information."""
    user_id = request.args.get('id', 'default')
    
    # Log profile access for security monitoring
    logger.info(f"Profile accessed for user ID: {user_id}")
    
    # Get user profile data
    profile_data = user_profiles.get(user_id, {
        'name': 'Unknown User',
        'role': 'Not Specified',
        'department': 'Not Assigned',
        'last_updated': 'Never'
    })
    
    return render_template('profile.html', profile=profile_data, user_id=user_id)

@app.route('/search')
def search():
    """User search functionality."""
    query = request.args.get('q', '')
    
    if query:
        # Log search queries for analytics
        logger.info(f"Search performed with query: {query}")
        
        # Simulate search results
        results = []
        for uid, profile in user_profiles.items():
            if query.lower() in profile['name'].lower() or query.lower() in profile['role'].lower():
                results.append({'id': uid, **profile})
        
        return render_template('search.html', results=results, query=query)
    
    return render_template('search.html', results=[], query='')

@app.route('/admin')
def admin():
    """Administrative dashboard (placeholder for future implementation)."""
    return render_template('admin.html')

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors gracefully."""
    logger.warning(f"404 error for path: {request.path}")
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors gracefully."""
    logger.error(f"Internal server error: {error}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Secure User Profile System on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

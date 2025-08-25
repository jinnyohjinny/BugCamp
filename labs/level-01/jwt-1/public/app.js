// Global state
let currentUser = null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileSection = document.getElementById('profileSection');
const authNav = document.getElementById('authNav');
const userNav = document.getElementById('userNav');

// Event listeners
document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
document.getElementById('registerFormElement').addEventListener('submit', handleRegister);

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Show login form
function showLogin() {
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
    profileSection.classList.add('d-none');
}

// Show register form
function showRegister() {
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
    profileSection.classList.add('d-none');
}

// Show profile section
function showProfile() {
    profileSection.classList.remove('d-none');
    loginForm.classList.add('d-none');
    registerForm.classList.add('d-none');
    updateProfileInfo();
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showAlert('Login successful!', 'success');
            updateNavigation();
            showProfile();
            document.getElementById('loginFormElement').reset();
        } else {
            showAlert(data.error || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred during login', 'danger');
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Registration successful! Please login.', 'success');
            document.getElementById('registerFormElement').reset();
            showLogin();
        } else {
            showAlert(data.error || 'Registration failed', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred during registration', 'danger');
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            updateNavigation();
            showProfile();
        }
    } catch (error) {
        // User not authenticated, show login form
        showLogin();
    }
}

// Update navigation based on authentication status
function updateNavigation() {
    if (currentUser) {
        authNav.classList.add('d-none');
        userNav.classList.remove('d-none');
    } else {
        authNav.classList.remove('d-none');
        userNav.classList.add('d-none');
    }
}

// Update profile information
function updateProfileInfo() {
    if (currentUser) {
        document.getElementById('profileUsername').textContent = currentUser.username;
        document.getElementById('profileRole').textContent = currentUser.role;
    }
}

// Check admin access
async function checkAdminAccess() {
    try {
        const response = await fetch('/api/admin');
        if (response.ok) {
            const data = await response.json();
            showAlert(`Admin access granted! ${data.message}`, 'success');
            // Update user role if they gained admin access
            if (currentUser) {
                currentUser.role = 'admin';
                updateProfileInfo();
            }
        } else {
            const data = await response.json();
            showAlert(data.error || 'Access denied', 'danger');
        }
    } catch (error) {
        showAlert('An error occurred while checking admin access', 'danger');
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        currentUser = null;
        updateNavigation();
        showLogin();
        showAlert('Logged out successfully', 'info');
    } catch (error) {
        showAlert('An error occurred during logout', 'danger');
    }
}

// Show alert messages
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" id="${alertId}" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHtml;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

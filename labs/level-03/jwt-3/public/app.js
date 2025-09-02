let currentUser = null;

function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('d-none');
    document.getElementById('registerForm').classList.add('d-none');
    document.getElementById('profileSection').classList.add('d-none');
    document.getElementById('authNav').classList.remove('d-none');
    document.getElementById('userNav').classList.add('d-none');
    document.getElementById('alertContainer').innerHTML = '';
}

function showRegister() {
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('registerForm').classList.remove('d-none');
    document.getElementById('profileSection').classList.add('d-none');
    document.getElementById('authNav').classList.remove('d-none');
    document.getElementById('userNav').classList.add('d-none');
    document.getElementById('alertContainer').innerHTML = '';
}

function showProfile() {
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('registerForm').classList.add('d-none');
    document.getElementById('profileSection').classList.remove('d-none');
    document.getElementById('authNav').classList.add('d-none');
    document.getElementById('userNav').classList.remove('d-none');
    document.getElementById('adminContent').classList.add('d-none');
    document.getElementById('alertContainer').innerHTML = '';
}

async function register(username, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Registration successful! Please login.', 'success');
            showLogin();
        } else {
            showAlert(data.error || 'Registration failed');
        }
    } catch (error) {
        showAlert('Network error occurred');
    }
}

async function login(username, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            document.getElementById('profileUsername').textContent = data.user.username;
            document.getElementById('profileRole').textContent = data.user.role;
            showProfile();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.error || 'Login failed');
        }
    } catch (error) {
        showAlert('Network error occurred');
    }
}

async function checkAdminAccess() {
    try {
        const response = await fetch('/api/admin');
        const data = await response.json();

        if (response.ok) {
            document.getElementById('adminContent').classList.remove('d-none');
            document.getElementById('adminKey').textContent = data.key;
            showAlert('Admin access granted!', 'success');
        } else {
            showAlert(data.error || 'Access denied');
        }
    } catch (error) {
        showAlert('Network error occurred');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST'
        });
        
        currentUser = null;
        showLogin();
        showAlert('Logged out successfully', 'info');
    } catch (error) {
        showAlert('Logout error occurred');
    }
}

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    await login(username, password);
});

document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    await register(username, password);
});

window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            document.getElementById('profileUsername').textContent = data.username;
            document.getElementById('profileRole').textContent = data.role;
            showProfile();
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
});
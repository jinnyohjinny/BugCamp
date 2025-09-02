class VaultApp {
    constructor() {
        this.currentUser = null;
        this.secrets = [];
        this.currentSecret = null;
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        document.getElementById('login-tab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('register-tab').addEventListener('click', () => this.switchTab('register'));
        
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        document.getElementById('add-secret-btn').addEventListener('click', () => this.showAddSecretModal());
        document.getElementById('add-secret-form').addEventListener('submit', (e) => this.handleAddSecret(e));
        
        document.getElementById('close-modal').addEventListener('click', () => this.hideAddSecretModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideAddSecretModal());
        
        document.getElementById('back-btn').addEventListener('click', () => this.showSecretsList());
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                this.showMainSection();
                this.loadSecrets();
            } else {
                this.showAuthSection();
            }
        } catch (error) {
            this.showAuthSection();
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
        
        document.getElementById(`${tab}-tab`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data;
                this.showMainSection();
                this.loadSecrets();
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            this.showError('Network error occurred');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data;
                this.showMainSection();
                this.loadSecrets();
            } else {
                this.showError(data.error || 'Registration failed');
            }
        } catch (error) {
            this.showError('Network error occurred');
        }
    }

    async handleLogout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            this.currentUser = null;
            this.secrets = [];
            this.showAuthSection();
        } catch (error) {
            this.showError('Logout failed');
        }
    }

    async loadSecrets() {
        try {
            const response = await fetch('/api/secrets');
            if (response.ok) {
                const data = await response.json();
                this.secrets = data.secrets;
                this.renderSecretsList();
            } else {
                this.showError('Failed to load secrets');
            }
        } catch (error) {
            this.showError('Network error occurred');
        }
    }

    renderSecretsList() {
        const secretsList = document.getElementById('secrets-list');
        
        if (this.secrets.length === 0) {
            secretsList.innerHTML = `
                <div class="empty-state">
                    <p>No secrets yet. Create your first secret to get started.</p>
                </div>
            `;
            return;
        }

        secretsList.innerHTML = this.secrets.map(secret => `
            <div class="secret-item" onclick="app.viewSecret(${secret.id})">
                <h3>${this.escapeHtml(secret.title)}</h3>
                <div class="meta">
                    Secret #${secret.id} • Created ${new Date(secret.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    async viewSecret(secretId) {
        try {
            const response = await fetch(`/api/secrets/${secretId}`);
            
            if (response.ok) {
                const secret = await response.json();
                this.currentSecret = secret;
                this.showSecretDetail();
            } else if (response.status === 404) {
                this.showError('Secret not found');
            } else {
                this.showError('Failed to load secret');
            }
        } catch (error) {
            this.showError('Network error occurred');
        }
    }

    showSecretDetail() {
        if (!this.currentSecret) return;

        document.getElementById('secret-title').textContent = this.currentSecret.title;
        document.getElementById('secret-value').textContent = this.currentSecret.value;
        document.getElementById('secret-date').textContent = new Date(this.currentSecret.created_at).toLocaleString();

        document.getElementById('secrets-list').style.display = 'none';
        document.getElementById('secret-detail').classList.remove('hidden');
        document.querySelector('.section-header').style.display = 'none';
    }

    showSecretsList() {
        document.getElementById('secret-detail').classList.add('hidden');
        document.getElementById('secrets-list').style.display = 'block';
        document.querySelector('.section-header').style.display = 'flex';
        this.currentSecret = null;
    }

    showAddSecretModal() {
        document.getElementById('add-secret-modal').classList.remove('hidden');
        document.getElementById('secret-title-input').value = '';
        document.getElementById('secret-value-input').value = '';
    }

    hideAddSecretModal() {
        document.getElementById('add-secret-modal').classList.add('hidden');
    }

    async handleAddSecret(e) {
        e.preventDefault();
        
        const title = document.getElementById('secret-title-input').value;
        const value = document.getElementById('secret-value-input').value;

        try {
            const response = await fetch('/api/secrets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, value })
            });

            const data = await response.json();

            if (response.ok) {
                this.hideAddSecretModal();
                this.loadSecrets();
            } else {
                this.showError(data.error || 'Failed to create secret');
            }
        } catch (error) {
            this.showError('Network error occurred');
        }
    }

    showAuthSection() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-section').classList.add('hidden');
        
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
    }

    showMainSection() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-section').classList.remove('hidden');
        document.getElementById('username').textContent = this.currentUser.username;
        this.showSecretsList();
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');

        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const app = new VaultApp();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// In-memory user storage (in production, use a database)
const users = new Map();
const JWT_SECRET = 'your-secret-key-change-in-production';

// Initialize with admin user
users.set('admin', {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
});

const vulnerableJWTVerify = (token, secret) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }
        
        const [headerB64, payloadB64, signature] = parts;
        
        const header = JSON.parse(Buffer.from(headerB64, 'base64').toString());
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        
        if (header.alg === 'none') {
            return payload;
        }
        
        return jwt.verify(token, secret);
        
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Use our vulnerable JWT verification
        const decoded = vulnerableJWTVerify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (users.has(username)) {
        return res.status(409).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.set(username, {
        username,
        password: hashedPassword,
        role: 'user'
    });
    
    res.json({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = users.get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
        { username: user.username, role: user.role },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
    );
    
    res.cookie('auth', token, { 
        httpOnly: true, 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 
    });
    
    res.json({ 
        message: 'Login successful',
        user: { username: user.username, role: user.role }
    });
});

app.get('/api/profile', authenticateToken, (req, res) => {
    const user = users.get(req.user.username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        username: user.username,
        role: user.role
    });
});

app.get('/api/admin', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({
        message: 'Welcome to admin panel',
        flag: 'FLAG{JWT_N0N3_ALG0R1THM_BYPASS}',
        secret: 'This is a secret admin-only resource'
    });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('auth');
    res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

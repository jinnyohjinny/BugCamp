const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Logging configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Database initialization
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default users
    const defaultUsers = [
        ['admin', 'admin123', 'admin'],
        ['test', 'test123', 'user'],
        ['user', 'password', 'user']
    ];

    const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    defaultUsers.forEach(([username, password, role]) => {
        const hashedPassword = bcrypt.hashSync(password, 10);
        stmt.run(username, hashedPassword, role);
    });
    stmt.finalize();
});

// JWT configuration - Generate keys dynamically
let privateKey, publicKey;

// Function to generate RSA key pair
function generateKeys() {
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    
    privateKey = priv;
    publicKey = pub;
    
    logger.info('RSA key pair generated successfully');
}

// Generate keys on startup
generateKeys();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Try to verify with RS256 first
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }
            
            const [headerB64, payloadB64, signatureB64] = parts;
            
            const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
            const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
            
            if (header.alg !== 'HS256') {
                throw new Error('Algorithm mismatch');
            }
            
            const data = `${headerB64}.${payloadB64}`;
            const expectedSignature = crypto
                .createHmac('sha256', publicKey)
                .update(data)
                .digest('base64url');
            
            if (signatureB64 !== expectedSignature) {
                throw new Error('Invalid signature');
            }
            
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                throw new Error('Token expired');
            }
            
            req.user = payload;
            next();
        } catch (hsError) {
            logger.error('JWT verification failed', { token: token.substring(0, 20) + '...', error: hsError.message });
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    res.json({ 
        message: 'Welcome to admin panel',
        flag: 'FLAG{JWT_ALGORITHM_CONFUSION_MASTERED}',
        user: req.user
    });
});

app.get('/public.pem', (req, res) => {
    res.setHeader('Content-Type', 'application/x-pem-file');
    res.setHeader('Content-Disposition', 'attachment; filename="public.pem"');
    res.send(publicKey);
});

// API endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, 'user'], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: 'Username already exists' });
                    }
                    logger.error('Database error during registration', { error: err.message, username });
                    return res.status(500).json({ error: 'Registration failed' });
                }
                
                logger.info('User registered successfully', { username, userId: this.lastID });
                res.status(201).json({ message: 'User registered successfully' });
            });
    } catch (error) {
        logger.error('Registration error', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                logger.error('Database error during login', { error: err.message, username });
                return res.status(500).json({ error: 'Login failed' });
            }

            if (!user) {
                logger.warn('Login attempt with non-existent username', { username });
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                logger.warn('Login attempt with invalid password', { username });
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                privateKey,
                { 
                    algorithm: 'RS256',
                    expiresIn: '24h'
                }
            );

            logger.info('User logged in successfully', { username, userId: user.id });
            
            // Set cookie
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({ 
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        });
    } catch (error) {
        logger.error('Login error', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    logger.info('User logged out', { userId: req.user?.userId });
    res.json({ message: 'Logout successful' });
});

app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({
        userId: req.user.userId,
        username: req.user.username,
        role: req.user.role
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Secure Portal server running on port ${PORT}`);
    console.log(`Secure Portal server running on port ${PORT}`);
});

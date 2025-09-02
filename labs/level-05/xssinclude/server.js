const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for users and secrets
const users = {};
const secrets = {};

// Helper function to get user from cookie
function getUserFromCookie(req) {
  const sessionId = req.cookies.session;
  if (!sessionId) return null;
  
  // Find user by session ID
  for (const email in users) {
    if (users[email].sessionId === sessionId) {
      return { email, ...users[email] };
    }
  }
  return null;
}

// Routes
app.get('/', (req, res) => {
  const user = getUserFromCookie(req);
  
  if (user) {
    // User is logged in, show the main application
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Secret Safe - Secure Vault</title>
          <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>Welcome to the Secret Safe</h1>
                  <p>Logged in as: ${user.email}</p>
                  <a href="/logout" class="logout-btn">Logout</a>
              </header>
              
              <div class="main-content">
                  <section class="add-secret">
                      <h2>Add New Secret</h2>
                      <form action="/secrets" method="POST">
                          <input type="text" name="title" placeholder="Secret Title" required>
                          <textarea name="content" placeholder="Secret Content" required></textarea>
                          <button type="submit">Create Secret</button>
                      </form>
                  </section>
                  
                  <section class="secrets-list">
                      <h2>Your Secrets</h2>
                      <ul id="secrets">
                          <!-- Secrets will be loaded dynamically -->
                      </ul>
                  </section>
              </div>
          </div>
          
          <script src="/app.js"></script>
          <script src="/secret.js"></script>
      </body>
      </html>
    `);
  } else {
    // User is not logged in, show signup form
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Secret Safe - Sign Up</title>
          <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>Welcome to the Secret Safe</h1>
                  <p>Your professional secure vault for managing personal secrets</p>
              </header>
              
              <div class="auth-form">
                  <h2>Sign Up</h2>
                  <form action="/signup" method="POST">
                      <input type="email" name="email" placeholder="Email Address" required>
                      <button type="submit">Sign Up</button>
                  </form>
              </div>
          </div>
      </body>
      </html>
    `);
  }
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).send('Email is required');
  }
  
  // Create new user session
  const sessionId = uuidv4();
  users[email] = {
    sessionId: sessionId,
    createdAt: new Date()
  };
  
  // Initialize empty secrets array for user
  secrets[email] = [];
  
  // Set session cookie
  res.cookie('session', sessionId, { 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.redirect('/');
});

// Create secret endpoint
app.post('/secrets', (req, res) => {
  const user = getUserFromCookie(req);
  
  if (!user) {
    return res.status(401).send('Unauthorized');
  }
  
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).send('Title and content are required');
  }
  
  // Add secret to user's secrets
  secrets[user.email].push({
    id: uuidv4(),
    title: title,
    content: content,
    createdAt: new Date()
  });
  
  res.redirect('/');
});

// Secret.js endpoint - serves secrets as JavaScript
app.get('/secret.js', (req, res) => {
  const user = getUserFromCookie(req);
  
  if (!user) {
    res.setHeader('Content-Type', 'application/javascript');
    return res.send('// No user session found');
  }
  
  const userSecrets = secrets[user.email] || [];
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
// Secret Safe - Dynamic Secret Loader
${userSecrets.map(secret => 
  `display("${secret.title.replace(/"/g, '\\"')}", "${secret.content.replace(/"/g, '\\"')}");`
).join('\n')}
  `);
});

// Logout endpoint
app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secret Safe running on port ${PORT}`);
});
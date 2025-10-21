import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

// INTENTIONAL: Remove security headers to trigger ZAP alerts
app.use((req, res, next) => {
  // Permissive CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // INTENTIONAL: Missing security headers that ZAP will flag
  // No CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
  
  // Keep Express default X-Powered-By for tech stack disclosure
  next();
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Simple HTML page without CSP/XFO (DAST should flag missing headers)
app.get('/insecure', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('<!doctype html><html><head><title>Insecure</title></head><body><h1>Insecure Page</h1><p>No CSP or XFO set.</p></body></html>');
});

// Set an insecure cookie (no Secure/HttpOnly/SameSite) for DAST to flag
app.get('/login', (_req, res) => {
  res.setHeader('Set-Cookie', 'sessionid=demo; Path=/');
  res.json({ message: 'Logged in (insecure cookie set)' });
});

// INTENTIONAL: Admin panel without authentication - ZAP will flag this as high risk
app.get('/admin', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head><title>Admin Panel</title></head>
      <body>
        <h1>Admin Panel</h1>
        <p>Welcome to the admin panel!</p>
        <p>User Management: <a href="/admin/users">View Users</a></p>
        <p>System Settings: <a href="/admin/settings">Settings</a></p>
        <p>Database: <a href="/admin/db">Database Access</a></p>
      </body>
    </html>
  `);
});

// INTENTIONAL: Sensitive data exposure - ZAP will flag this
app.get('/admin/users', (_req, res) => {
  res.json({
    users: [
      { id: 1, username: 'admin', password: 'admin123', email: 'admin@company.com', role: 'admin' },
      { id: 2, username: 'user1', password: 'password123', email: 'user1@company.com', role: 'user' },
      { id: 3, username: 'user2', password: 'qwerty', email: 'user2@company.com', role: 'user' }
    ],
    message: 'All users retrieved successfully'
  });
});

// INTENTIONAL: Database credentials exposure - ZAP will flag this
app.get('/admin/db', (_req, res) => {
  res.json({
    database: {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres123',
      database: 'production_db'
    },
    connection_string: 'postgresql://postgres:postgres123@localhost:5432/production_db'
  });
});

// INTENTIONAL: Debug endpoint with stack traces - ZAP will flag this
app.get('/debug', (_req, res) => {
  try {
    throw new Error('Debug information - this should not be exposed in production');
  } catch (error) {
    const err = error as Error;
    res.json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      environment: 'production',
      debug_mode: true
    });
  }
});

// INTENTIONAL: Authentication bypass - ZAP will flag this
app.get('/bypass', (_req, res) => {
  res.json({
    message: 'Authentication bypassed successfully',
    user: 'admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  });
});

// INTENTIONAL: Sensitive data exposure without obvious SAST patterns
app.get('/api/config', (_req, res) => {
  res.json({
    environment: 'production',
    debug_mode: true,
    api_keys: {
      stripe: 'sk_test_51234567890abcdef',
      aws: 'AKIAIOSFODNN7EXAMPLE',
      github: 'ghp_1234567890abcdef'
    },
    database_url: 'postgresql://user:password@localhost:5432/prod_db'
  });
});

// INTENTIONAL: Missing rate limiting - DAST will flag this
app.get('/api/unlimited', (_req, res) => {
  res.json({
    message: 'This endpoint has no rate limiting',
    timestamp: new Date().toISOString(),
    requests: Math.floor(Math.random() * 1000)
  });
});

// INTENTIONAL: Weak session management - DAST will flag this
app.get('/api/session', (_req, res) => {
  const sessionId = Math.random().toString(36).substring(2);
  res.setHeader('Set-Cookie', `session=${sessionId}; Path=/; Domain=.example.com`);
  res.json({
    session_id: sessionId,
    expires: 'never',
    secure: false
  });
});

// INTENTIONAL: HIGH RISK - Reflected XSS (ZAP will definitely catch this)
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.setHeader('Content-Type', 'text/html');
  res.send(`<html><body><h1>Search Results</h1><p>You searched for: ${query}</p></body></html>`);
});

// INTENTIONAL: HIGH RISK - SQL Injection (ZAP will definitely catch this)
app.get('/users', (req, res) => {
  const id = req.query.id || '1';
  const sqlQuery = `SELECT * FROM users WHERE id = ${id}`;
  res.json({ 
    message: 'User query executed', 
    query: sqlQuery,
    result: 'User found with ID: ' + id
  });
});

// INTENTIONAL: HIGH RISK - Directory Traversal (ZAP will definitely catch this)
app.get('/file', (req, res) => {
  const filename = String(req.query.name || 'package.json');
  const filePath = path.join(__dirname, '..', filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (error) {
    res.status(404).send('File not found: ' + filename);
  }
});

// INTENTIONAL: HIGH RISK - Authentication Bypass (ZAP will definitely catch this)
app.get('/admin', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body>
        <h1>Admin Panel</h1>
        <p>Welcome to the admin panel!</p>
        <p>You have full administrative access.</p>
        <a href="/admin/users">View Users</a> | 
        <a href="/admin/settings">Settings</a>
      </body>
    </html>
  `);
});

// INTENTIONAL: HIGH RISK - Sensitive Data Exposure (ZAP will definitely catch this)
app.get('/admin/users', (_req, res) => {
  res.json({
    users: [
      { id: 1, username: 'admin', password: 'admin123', email: 'admin@company.com' },
      { id: 2, username: 'user1', password: 'password123', email: 'user1@company.com' },
      { id: 3, username: 'user2', password: 'qwerty', email: 'user2@company.com' }
    ]
  });
});

export default app;
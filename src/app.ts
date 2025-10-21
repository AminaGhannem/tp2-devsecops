import express from 'express';

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

export default app;
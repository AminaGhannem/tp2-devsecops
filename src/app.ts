import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello!');
});

// DAST-only vulnerability: Missing security headers (runtime behavior)
app.get('/api/users', (req, res) => {
  // Intentionally missing security headers - DAST will detect this
  res.json({ users: [] });
});

// DAST-only vulnerability: HTTP method not allowed but accessible
app.get('/api/admin', (req, res) => {
  // Should require POST but allows GET - DAST will flag this
  res.json({ message: 'Admin endpoint accessible via GET' });
});

// DAST-only vulnerability: Directory traversal via URL parameter
app.get('/files', (req, res) => {
  const filename = req.query.file;
  // DAST will test for directory traversal attacks
  res.send(`File content for: ${filename}`);
});

// DAST-only vulnerability: Missing CSRF protection
app.post('/api/transfer', (req, res) => {
  // No CSRF token validation - DAST will detect this
  res.json({ message: 'Transfer completed' });
});

// DAST-only vulnerability: Session fixation
app.get('/login', (req, res) => {
  // No session regeneration - DAST will flag this
  res.json({ message: 'Login page' });
});

// DAST-only vulnerability: Information disclosure via error messages
app.get('/api/error', (req, res) => {
  // DAST will test for error message information disclosure
  res.status(500).json({ 
    error: 'Database connection failed',
    details: 'Connection to postgresql://admin:password@localhost:5432/db failed',
    stack: 'Error: ECONNREFUSED at Database.connect()'
  });
});

// DAST-only vulnerability: Weak session management
app.get('/api/session', (req, res) => {
  // No secure session flags - DAST will detect this
  res.json({ sessionId: 'insecure_session_123' });
});

export default app;
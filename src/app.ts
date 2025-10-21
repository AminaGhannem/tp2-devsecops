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

// INTENTIONAL: Reflected XSS vulnerability for ZAP detection
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.setHeader('Content-Type', 'text/html');
  // Directly embedding user input without sanitization - ZAP will catch this
  res.send(`<!doctype html><html><head><title>Search</title></head><body><h1>Search Results</h1><p>You searched for: ${query}</p></body></html>`);
});

// INTENTIONAL: Directory traversal vulnerability for ZAP detection
app.get('/file', (req, res) => {
  const filename = String(req.query.name || 'index.html');
  // No path validation - ZAP will catch directory traversal attempts
  const filePath = path.join(__dirname, '..', filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.send(content);
  } catch (error) {
    res.status(404).send('File not found');
  }
});

// INTENTIONAL: SQL injection simulation for ZAP detection
app.get('/users', (req, res) => {
  const id = req.query.id || '1';
  // Simulate SQL injection vulnerability - ZAP will detect this pattern
  const sqlQuery = `SELECT * FROM users WHERE id = ${id}`;
  res.json({ 
    message: 'User query executed', 
    query: sqlQuery,
    note: 'This is a simulated SQL injection vulnerability for DAST testing'
  });
});

// INTENTIONAL: Command injection simulation
app.get('/ping', (req, res) => {
  const host = req.query.host || 'localhost';
  // Simulate command injection - ZAP will detect this pattern
  const command = `ping -c 1 ${host}`;
  res.json({ 
    message: 'Ping command executed', 
    command: command,
    note: 'This is a simulated command injection vulnerability for DAST testing'
  });
});

export default app;
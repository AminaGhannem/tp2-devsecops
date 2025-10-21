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

export default app;
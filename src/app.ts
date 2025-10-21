import express from 'express';

const app = express();

// INTENTIONAL: Insecure headers for DAST-only detection (no SAST taint flows)
app.use((req, res, next) => {
  // Permissive CORS configuration intended to be caught by DAST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Do not set common security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
  // Many DAST scanners will flag these as missing

  // Keep Express default X-Powered-By to allow tech stack disclosure
  next();
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Simple HTML page without CSP headers (DAST should flag missing CSP/XFO)
app.get('/insecure', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('<!doctype html><html><head><title>Insecure</title></head><body><h1>Insecure Page</h1><p>No CSP or XFO set.</p></body></html>');
});

export default app;
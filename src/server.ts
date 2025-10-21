import app from './app';
import express from 'express';

const port = 3000;

// INTENTIONAL: Server-level security misconfigurations for DAST detection
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  
  // INTENTIONAL: Expose server information - DAST will flag this
  console.log('Server started with debug mode enabled');
  console.log('Environment: production');
  console.log('Database: postgresql://admin:password123@localhost:5432/prod_db');
  console.log('API Keys: stripe=sk_live_1234567890, aws=AKIAIOSFODNN7EXAMPLE');
});

// INTENTIONAL: Missing security headers at server level
server.on('request', (req, res) => {
  // Remove security headers that Express might add
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-XSS-Protection');
  
  // Set insecure headers
  res.setHeader('Server', 'Express/5.1.0 (Ubuntu)');
  res.setHeader('X-Powered-By', 'Express');
});

// INTENTIONAL: Expose error details - DAST will flag this
server.on('error', (err) => {
  console.error('Server error:', err);
  console.error('Stack trace:', err.stack);
  console.error('Environment variables:', process.env);
});

// INTENTIONAL: Missing HTTPS enforcement
process.env.NODE_ENV = 'production';
process.env.DEBUG = '*';
process.env.LOG_LEVEL = 'debug';

// INTENTIONAL: Expose internal server information
app.get('/server-info', (_req, res) => {
  res.json({
    server: 'Express/5.1.0',
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    debug_mode: process.env.DEBUG,
    pid: process.pid,
    cwd: process.cwd(),
    argv: process.argv
  });
});

// INTENTIONAL: Health check with sensitive information
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database_status: 'connected',
    redis_status: 'connected',
    api_keys_loaded: true,
    debug_mode: true,
    environment: 'production'
  });
});

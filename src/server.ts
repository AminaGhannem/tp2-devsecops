import app from './app';
import express from 'express';

const port = 3000;

// Load runtime security configuration
const securityConfig = require('./security-config.js');

// Set environment variables that introduce DAST vulnerabilities
process.env.NODE_ENV = 'production';
process.env.DEBUG = '*';
process.env.LOG_LEVEL = 'debug';
process.env.EXPOSE_STACK_TRACES = 'true';
process.env.EXPOSE_ENVIRONMENT = 'true';
process.env.EXPOSE_DATABASE_INFO = 'true';
process.env.WEAK_PASSWORD_POLICY = 'true';
process.env.NO_RATE_LIMIT = 'true';
process.env.INSECURE_SESSION_CONFIG = 'true';
process.env.CORS_ALLOW_ALL = 'true';
process.env.MISSING_SECURITY_HEADERS = 'true';

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

// Apply runtime security misconfigurations - DAST will detect these
server.on('request', (req, res) => {
  // Apply missing security headers based on config
  Object.keys(securityConfig.securityHeaders).forEach(header => {
    if (!securityConfig.securityHeaders[header]) {
      res.removeHeader(header);
    }
  });
  
  // Apply insecure CORS configuration
  res.setHeader('Access-Control-Allow-Origin', securityConfig.cors.origin);
  res.setHeader('Access-Control-Allow-Credentials', securityConfig.cors.credentials.toString());
  
  // Set insecure server headers
  res.setHeader('Server', 'Express/5.1.0 (Ubuntu)');
  res.setHeader('X-Powered-By', 'Express');
});

// Runtime error handling with information disclosure
server.on('error', (err) => {
  if (securityConfig.debug.exposeStackTraces) {
    console.error('Detailed error:', err.stack);
  }
  if (securityConfig.debug.exposeEnvironment) {
    console.error('Environment:', process.env);
  }
});

// Runtime endpoints that expose information based on config
app.get('/server-info', (_req, res) => {
  const info: any = {
    server: 'Express/5.1.0',
    node_version: process.version,
    platform: process.platform
  };
  
  if (securityConfig.debug.exposeEnvironment) {
    info.environment = process.env.NODE_ENV;
    info.debug_mode = process.env.DEBUG;
  }
  
  if (securityConfig.debug.exposeDatabaseInfo) {
    info.database_url = 'postgresql://admin:password123@localhost:5432/prod_db';
    info.api_keys = {
      stripe: 'sk_live_1234567890',
      aws: 'AKIAIOSFODNN7EXAMPLE'
    };
  }
  
  res.json(info);
});

// Runtime authentication bypass endpoint
app.get('/auth-bypass', (req, res) => {
  const token = req.query.token;
  if (token === securityConfig.auth.bypassToken) {
    res.json({ 
      authenticated: true, 
      message: 'Authentication bypassed',
      admin: true 
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Runtime health check with conditional information disclosure
app.get('/health', (_req, res) => {
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  
  if (securityConfig.debug.exposeDatabaseInfo) {
    health.database_status = 'connected';
    health.redis_status = 'connected';
    health.api_keys_loaded = true;
    health.debug_mode = true;
    health.environment = 'production';
  }
  
  res.json(health);
});

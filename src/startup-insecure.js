// Startup script that loads insecure middleware
// This file is executed after the main server starts

const { insecureMiddleware, insecureErrorHandler, securityConfig } = require('./insecure-middleware.js');

// This function will be called to apply DAST vulnerabilities
function applyInsecureConfiguration(app, server) {
  // Apply insecure middleware
  app.use(insecureMiddleware);
  app.use(insecureErrorHandler);
  
  // Add vulnerable endpoints
  app.get('/server-info', (req, res) => {
    const info = {
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
  
  app.get('/health', (req, res) => {
    const health = {
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
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.DEBUG = '*';
  process.env.LOG_LEVEL = 'debug';
}

module.exports = { applyInsecureConfiguration };

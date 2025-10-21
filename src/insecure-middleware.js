// This file contains DAST vulnerabilities but won't be detected by SAST
// because it's loaded dynamically at runtime

const fs = require('fs');
const path = require('path');

// Load security configuration from external file
let securityConfig = {};
try {
  const configPath = path.join(__dirname, 'security-config.json');
  if (fs.existsSync(configPath)) {
    securityConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  // Use default insecure configuration
  securityConfig = {
    securityHeaders: {
      'X-Content-Type-Options': false,
      'X-Frame-Options': false,
      'X-XSS-Protection': false,
      'Strict-Transport-Security': false,
      'Content-Security-Policy': false
    },
    cors: {
      origin: '*',
      credentials: true
    },
    debug: {
      exposeStackTraces: true,
      exposeEnvironment: true,
      exposeDatabaseInfo: true
    },
    auth: {
      bypassToken: 'test123'
    }
  };
}

// Middleware that introduces DAST vulnerabilities
function insecureMiddleware(req, res, next) {
  // Remove security headers
  Object.keys(securityConfig.securityHeaders).forEach(header => {
    if (!securityConfig.securityHeaders[header]) {
      res.removeHeader(header);
    }
  });
  
  // Set insecure CORS headers
  res.setHeader('Access-Control-Allow-Origin', securityConfig.cors.origin);
  res.setHeader('Access-Control-Allow-Credentials', securityConfig.cors.credentials.toString());
  
  // Set insecure server headers
  res.setHeader('Server', 'Express/5.1.0 (Ubuntu)');
  res.setHeader('X-Powered-By', 'Express');
  
  next();
}

// Error handler that exposes information
function insecureErrorHandler(err, req, res, next) {
  if (securityConfig.debug.exposeStackTraces) {
    console.error('Stack trace:', err.stack);
  }
  if (securityConfig.debug.exposeEnvironment) {
    console.error('Environment:', process.env);
  }
  next(err);
}

module.exports = {
  insecureMiddleware,
  insecureErrorHandler,
  securityConfig
};

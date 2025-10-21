// Runtime security configuration that introduces DAST vulnerabilities
// This file is loaded at runtime and won't be detected by SAST

module.exports = {
  // Missing security headers - DAST will detect these
  securityHeaders: {
    'X-Content-Type-Options': false,
    'X-Frame-Options': false,
    'X-XSS-Protection': false,
    'Strict-Transport-Security': false,
    'Content-Security-Policy': false,
    'Referrer-Policy': false
  },
  
  // Insecure CORS configuration - DAST will flag this
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  
  // Session configuration vulnerabilities - DAST will detect these
  session: {
    secure: false,
    httpOnly: false,
    sameSite: 'none',
    maxAge: 86400000 // 24 hours - too long
  },
  
  // Authentication bypass - DAST will detect this
  auth: {
    bypassToken: 'test123',
    weakPasswordPolicy: true,
    noRateLimit: true
  },
  
  // Information disclosure - DAST will flag these
  debug: {
    exposeStackTraces: true,
    exposeEnvironment: true,
    exposeDatabaseInfo: true
  }
};

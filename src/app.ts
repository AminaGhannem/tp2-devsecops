import express from 'express';

const app = express();

// Enable JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello!');
});

// DAST Vulnerability 1: SQL Injection (High Risk)
app.get('/search', (req, res) => {
  const query = req.query.q as string;
  // Simulated SQL injection vulnerability - ZAP will detect this
  const sqlQuery = `SELECT * FROM users WHERE name = '${query}'`;
  res.json({ 
    message: 'Search completed', 
    query: sqlQuery,
    results: 'This would execute: ' + sqlQuery 
  });
});

// DAST Vulnerability 2: Cross-Site Scripting (XSS) - High Risk
app.get('/profile', (req, res) => {
  const username = req.query.username as string;
  // XSS vulnerability - directly outputting user input without sanitization
  const html = `
    <html>
      <body>
        <h1>User Profile</h1>
        <p>Welcome, ${username}!</p>
        <script>alert('XSS Vulnerability Detected!')</script>
      </body>
    </html>
  `;
  res.send(html);
});

// DAST Vulnerability 3: Insecure Direct Object Reference - Medium Risk
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // No authorization check - any user can access any other user's data
  res.json({
    userId: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    sensitiveData: `This is sensitive data for user ${userId}`
  });
});

// DAST Vulnerability 4: Information Disclosure - Medium Risk
app.get('/debug', (req, res) => {
  // Exposing sensitive system information
  res.json({
    environment: 'production',
    databaseUrl: 'postgresql://admin:password123@db.example.com:5432/myapp',
    apiKeys: {
      stripe: 'sk_live_1234567890abcdef',
      aws: 'AKIAIOSFODNN7EXAMPLE'
    },
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    }
  });
});

// DAST Vulnerability 5: Missing Security Headers - Medium Risk
app.get('/insecure', (req, res) => {
  // This endpoint intentionally lacks security headers
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>Insecure Page</title>
      </head>
      <body>
        <h1>This page lacks security headers</h1>
        <p>No CSP, HSTS, or other security headers present</p>
      </body>
    </html>
  `);
});

export default app;
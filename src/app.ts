import express from 'express';

const app = express();

// INTENTIONAL: Enable JSON parsing without size limits for DAST testing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.send('Hello!');
});

// INTENTIONAL: SQL Injection vulnerability - DAST will flag this
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  // Vulnerable SQL query construction - DAST scanners will detect this
  const sqlQuery = `SELECT * FROM users WHERE id = ${userId}`;
  
  // Simulate database response
  res.json({
    message: 'User data retrieved',
    query: sqlQuery,
    user: {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
});

// INTENTIONAL: Insecure Direct Object Reference (IDOR) vulnerability
app.get('/admin/users/:userId', (req, res) => {
  const userId = req.params.userId;
  // No authorization check - DAST will flag this
  res.json({
    message: 'Admin access granted',
    user: {
      id: userId,
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
      sensitive_data: 'This should be protected'
    }
  });
});

// INTENTIONAL: XSS vulnerability - DAST will flag this
app.get('/search', (req, res) => {
  const query = req.query.q;
  // Direct output without sanitization - DAST will detect XSS
  res.send(`
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${query}</p>
        <p>No results found for "${query}"</p>
      </body>
    </html>
  `);
});

// INTENTIONAL: Weak authentication mechanism
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Weak password validation - DAST will flag this
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'weak_token_12345',
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// INTENTIONAL: Information disclosure vulnerability
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env,
    server_info: {
      version: '1.0.0',
      debug_mode: true,
      database_url: 'postgresql://admin:password123@localhost:5432/prod_db',
      api_keys: {
        stripe: 'sk_live_1234567890',
        aws: 'AKIAIOSFODNN7EXAMPLE'
      }
    }
  });
});

export default app;
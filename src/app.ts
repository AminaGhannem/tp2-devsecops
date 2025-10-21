import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello!');
});

// INTENTIONAL VULNERABILITY: Reflected XSS for DAST testing
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  // Directly embedding user input without sanitization
  res.send(`<html><body><h1>Search Results</h1><p>You searched for: ${query}</p></body></html>`);
});

export default app;
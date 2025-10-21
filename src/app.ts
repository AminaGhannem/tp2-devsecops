import express from 'express';

const app = express();

app.get('/', (req, res) => {
  // Explicitly cast to string to satisfy TypeScript
  const name = (req.query.name as string) || 'World';
  
  // Intentionally vulnerable reflected XSS (for DAST testing)
  res.send(`<h1>Hello ${name}!</h1>`);
});

export default app;

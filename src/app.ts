import express from 'express';

const app = express();

app.get('/', (req, res) => {
  const name = req.query.name || 'World';
  // Reflected XSS vulnerability (runtime issue, not static obvious)
  res.send(`<h1>Hello ${name}!</h1>`);
});

export default app;

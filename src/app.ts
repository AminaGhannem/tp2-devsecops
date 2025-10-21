import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Clean endpoints with no static analysis issues
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.get('/api/admin', (req, res) => {
  res.json({ message: 'Admin endpoint' });
});

app.get('/files', (req, res) => {
  const filename = req.query.file;
  res.send(`File content for: ${filename}`);
});

app.post('/api/transfer', (req, res) => {
  res.json({ message: 'Transfer completed' });
});

app.get('/login', (req, res) => {
  res.json({ message: 'Login page' });
});

app.get('/api/error', (req, res) => {
  res.status(500).json({ 
    error: 'Database connection failed',
    details: 'Connection failed',
    stack: 'Error at Database.connect()'
  });
});

app.get('/api/session', (req, res) => {
  res.json({ sessionId: 'session_123' });
});

export default app;
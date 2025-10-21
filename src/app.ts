import express from 'express';

const app = express();

app.get('/', (req, res) => {
  // keep root simple so unit tests pass
  res.send('Hello!');
});

// deliberately vulnerable endpoint — reflected XSS at runtime
app.get('/vuln', (req, res) => {
  const q = String(req.query.q ?? 'World');

  // reflect user input unsanitized into HTML (will be detected by ZAP)
  const html = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Vuln</title></head>
      <body>
        <h1>Test reflected XSS</h1>
        <form action="/vuln" method="get">
          <input name="q" value="${q}" />
          <button type="submit">Search</button>
        </form>
        <div id="result">You searched for: ${q}</div>
      </body>
    </html>
  `;

  res.send(html);
});

export default app;

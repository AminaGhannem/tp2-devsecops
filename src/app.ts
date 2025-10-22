import express from 'express';

const app = express();

app.get('/', (req, res) => {
  // keep root simple so unit tests pass
  res.send('Hello!');
});

app.get('/vuln', (req, res) => {
  const q = String(req.query.q ?? 'World');

  const html = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Vuln (fixed)</title></head>
      <body>
        <h1>Test reflected XSS (fixed)</h1>
        <form action="/vuln" method="get">
          <input id="qinput" name="q" value="" />
          <button type="submit">Search</button>
        </form>
        <div id="result">You searched for: <span id="resultText"></span></div>

        <script>
          // safe: set values via textContent/value assignment (no innerHTML)
          const params = new URLSearchParams(location.search);
          const q = params.get('q') || 'World';
          document.getElementById('qinput').value = q;
          document.getElementById('resultText').textContent = q;
        </script>
      </body>
    </html>
  `;
  res.send(html);
});


export default app;
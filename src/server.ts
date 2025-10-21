import app from './app';

const port = 3000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  
  // Load insecure configuration after server starts
  // This ensures DAST vulnerabilities are applied at runtime
  setTimeout(() => {
    try {
      const { applyInsecureConfiguration } = require('./startup-insecure.js');
      applyInsecureConfiguration(app, server);
      console.log('Insecure configuration applied');
    } catch (err) {
      console.log('Could not load insecure configuration');
    }
  }, 100);
});

export default server;

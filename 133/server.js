// run server.js to allow cors policies 

// server.js
const http = require('http');

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Chrome 133 Detection</title>
    <style>body { font-family: Arial; }</style>
  </head>
  <body>
    <h1>Chrome 133 Automation Detection</h1>
  </body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  res.end(html);
});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});

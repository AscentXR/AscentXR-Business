const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '18.4' }));
    return;
  }

  // Default to dashboard_v18.html for root
  let filePath = req.url === '/' ? '/dashboard_v18.html' : req.url;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 Server Error</h1><p>${err.code}</p>`);
      }
    } else {
      // Success
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Ascent XR Dashboard v18.4 running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

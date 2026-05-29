// 古海大陆 · 内置静态服务器（不依赖 npx serve）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function tryListen(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath === '/') urlPath = '/index.html';
      const file = path.normalize(path.join(ROOT, urlPath.replace(/^\//, '').replace(/\.\./g, '')));
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, port }));
  });
}

(async () => {
  const ports = [3000, 3001, 5500, 8080];
  for (const p of ports) {
    try {
      const { port } = await tryListen(p);
      const url = `http://127.0.0.1:${port}`;
      console.log('');
      console.log('  ========================================');
      console.log('    古海大陆 · 服务器已启动');
      console.log('    浏览器打开:');
      console.log('  ========================================');
      console.log('');
      console.log(`  ${url}`);
      console.log('');
      console.log('  请保持本窗口打开。Ctrl+C 停止。');
      console.log('');
      try { fs.writeFileSync(path.join(ROOT, 'last-url.txt'), url, 'utf8'); } catch (_) {}
      if (process.platform === 'win32') {
        exec(`start "" "${url}"`);
      }
      return;
    } catch (e) {
      if (e.code !== 'EADDRINUSE') {
        console.error('启动失败:', e.message);
        process.exit(1);
      }
    }
  }
  console.error('端口 3000/3001/5500/8080 均被占用，请关闭其它服务后重试。');
  process.exit(1);
})();

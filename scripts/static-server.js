const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3003;
const staticDir = path.join(__dirname, '../out');
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = decodeURIComponent(parsedUrl.pathname || '/');
  const filePath = path.resolve(staticDir, `.${pathname}`);

  if (filePath !== staticDir && !filePath.startsWith(`${staticDir}${path.sep}`)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // 尝试多种路径策略
  const tryFiles = (paths, index = 0) => {
    if (index >= paths.length) {
      res.writeHead(404);
      return res.end('File not found');
    }

    const currentPath = paths[index];
    
    fs.stat(currentPath, (err, stats) => {
      if (err) {
        // 文件不存在，尝试下一个路径
        return tryFiles(paths, index + 1);
      }

      let finalPath = currentPath;
      if (stats.isDirectory()) {
        finalPath = path.join(currentPath, 'index.html');
      }

      fs.readFile(finalPath, (err, data) => {
        if (err) {
          // 读取失败，尝试下一个路径
          return tryFiles(paths, index + 1);
        }
        
        // 简单处理MIME类型
        const ext = path.extname(finalPath);
        const contentTypes = {
          '.avif': 'image/avif',
          '.css': 'text/css',
          '.html': 'text/html; charset=utf-8',
          '.ico': 'image/x-icon',
          '.js': 'text/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.txt': 'text/plain; charset=utf-8',
          '.webp': 'image/webp',
          '.woff2': 'font/woff2',
          '.xml': 'application/xml; charset=utf-8',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
  };

  // 构建要尝试的路径列表
  const pathsToTry = [];
  
  // 1. 原始路径
  pathsToTry.push(filePath);
  
  // 2. 静态导出的路由可能包含点号（例如版本号），仍需尝试.html
  const normalizedFilePath = filePath.endsWith(path.sep)
    ? filePath.slice(0, -1)
    : filePath;
  pathsToTry.push(normalizedFilePath + '.html');
  
  // 3. 如果不是目录路径（没有/结尾），尝试作为目录+index.html
  if (!filePath.endsWith('/')) {
    pathsToTry.push(path.join(filePath, 'index.html'));
  }

  tryFiles(pathsToTry);
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}`);
});
    

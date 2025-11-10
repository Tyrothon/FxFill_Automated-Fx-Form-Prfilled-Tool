const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      ws: true,
      logLevel: 'silent',
      onError(err, req, res) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API proxy error: please check backend status.' }));
      },
    })
  );
};
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 일반 HTTP 요청 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://0ef8-182-229-89-82.ngrok-free.app/api',
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq, req) => {
        console.log('Proxying request to:', proxyReq.getHeader('host'));
        proxyReq.setHeader('X-Special-Proxy-Header', 'my-proxy');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Proxy response received:', proxyRes.statusCode);
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      logLevel: 'debug', // 디버그 로그 활성화
    })
  );

  // 웹소켓 요청 프록시
  app.use(
    '/ws-stomp',
    createProxyMiddleware({
      target: 'https://0ef8-182-229-89-82.ngrok-free.app/', // Spring 서버 주소
      changeOrigin: true,
      ws: true, // 웹소켓 지원 활성화
      secure: false, // HTTPS를 사용하지 않을 경우 false
      onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader('X-Special-Proxy-Header', 'websocket-proxy');
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      logLevel: 'debug', // 디버그 로그를 활성화하여 문제를 파악할 수 있음
    })
  );
};

const { createProxyMiddleware } = require("http-proxy-middleware");

// Ngrok 서버 주소를 상수로 관리
const NGROK_SERVER = "https://eca5-117-111-1-139.ngrok-free.app/";

module.exports = function (app) {
  // 일반 HTTP 요청 프록시
  app.use(
    "/axios",
    createProxyMiddleware({
      target: NGROK_SERVER,
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq, req) => {
        console.log("Proxying request to:", req.method, req.path);
        proxyReq.setHeader("X-Special-Proxy-Header", "my-proxy");
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log("Proxy response received:", proxyRes.statusCode, req.path);

        // CORS 헤더
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
      },
      logLevel: "debug", // 디버그 로그 활성화
    })
  );

  // 웹소켓 요청 프록시 - 두 경로 모두 처리
  const wsProxyConfig = {
    target: NGROK_SERVER,
    changeOrigin: true,
    ws: true,
    secure: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      console.log("WebSocket proxy request:", req.path);
      proxyReq.setHeader("X-Special-Proxy-Header", "websocket-proxy");
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("WebSocket proxy response:", proxyRes.statusCode);
      // WebSocket의 경우 여기서 헤더를 수정하지 마세요
    },
  };

  // 두 WebSocket 경로 모두 처리
  app.use("/ws-stomp", createProxyMiddleware(wsProxyConfig));
};

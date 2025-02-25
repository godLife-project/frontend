const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api/v1", {
      target: "https://2b4d-182-229-89-82.ngrok-free.app",
      changeOrigin: true,
    })
  );
};
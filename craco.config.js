const path = require("path");

module.exports = {
  style: {
    postcss: {
      mode: "file",
    },
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devServer: {
    allowedHosts: "all",
  },
};

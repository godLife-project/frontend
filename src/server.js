// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React 앱의 URL
    methods: ["GET", "POST"],
  },
});

// 연결된 사용자 관리
const users = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 사용자가 채팅방에 참여
  socket.on("join_chat", (data) => {
    users[socket.id] = data.username;
    console.log(`${data.username} joined the chat`);

    // 시스템 메시지 전송
    io.emit("receive_message", {
      id: Date.now(),
      text: `${data.username}님이 채팅에 참여했습니다.`,
      sender: "system",
      timestamp: new Date(),
    });
  });

  // 메시지 수신 및 브로드캐스트
  socket.on("send_message", (data) => {
    console.log(`Message received: ${data.text}`);
    io.emit("receive_message", data);
  });

  // 사용자 연결 해제
  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      console.log(`User disconnected: ${username}`);

      // 시스템 메시지 전송
      io.emit("receive_message", {
        id: Date.now(),
        text: `${username}님이 채팅방을 나갔습니다.`,
        sender: "system",
        timestamp: new Date(),
      });

      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

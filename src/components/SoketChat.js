"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import io from "socket.io-client";

const SocketChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const messagesEndRef = useRef(null);

  // Socket.io 연결 설정
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 메시지 수신 리스너 설정
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  // 새 메시지 수신 시 스크롤 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 참여 처리
  const handleJoinChat = () => {
    if (!username.trim()) return;

    socket.emit("join_chat", { username });
    setIsJoined(true);
  };

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!newMessage.trim() || !isJoined) return;

    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: username,
      timestamp: new Date(),
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!isJoined) {
        handleJoinChat();
      } else {
        handleSendMessage();
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>실시간 채팅</CardTitle>
      </CardHeader>

      <CardContent>
        {!isJoined ? (
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="닉네임을 입력하세요..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleJoinChat}>참여</Button>
          </div>
        ) : (
          <ScrollArea className="h-80 rounded-md border p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === username
                      ? "justify-end"
                      : message.sender === "system"
                      ? "justify-center"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      message.sender === username
                        ? "bg-primary text-primary-foreground"
                        : message.sender === "system"
                        ? "bg-muted text-muted-foreground text-sm"
                        : "bg-secondary"
                    }`}
                  >
                    {message.sender !== "system" &&
                      message.sender !== username && (
                        <p className="text-xs font-medium mb-1">
                          {message.sender}
                        </p>
                      )}
                    <p>{message.text}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {isJoined && (
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>전송</Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SocketChat;

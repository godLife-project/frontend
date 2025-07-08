import React, { useState } from "react";
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

const SimpleChat = () => {
  // 채팅 메시지를 저장할 상태
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요!", sender: "system", timestamp: new Date() },
  ]);

  // 입력 필드의 값을 저장할 상태
  const [newMessage, setNewMessage] = useState("");

  // 메시지 전송 처리 함수
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // 새 메시지 객체 생성
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // 메시지 배열에 새 메시지 추가
    setMessages([...messages, message]);

    // 입력 필드 초기화
    setNewMessage("");
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>채팅</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
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
    </Card>
  );
};

export default SimpleChat;

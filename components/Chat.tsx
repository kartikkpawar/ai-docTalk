"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";
import MessageList from "./MessageList";

type Props = { chatId: number };

const Chat = ({ chatId }: Props) => {
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
  });

  return (
    <div className="relative max-h-screen overflow-scroll">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      <form
        onSubmit={handleSubmit}
        className="sticky inset-x-0 top-0 px-2 py-4 bg-white flex"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask any question..."
          className="w-full"
        />
        <Button className="ml-2 bg-blue-600">
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
      <MessageList messages={messages} />
    </div>
  );
};

export default Chat;

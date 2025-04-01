"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import ChatWidget from "./ChatWidget";

export default function PortfolioChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatWidget isOpenExternal={isOpen} setIsOpenExternal={setIsOpen} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center rounded-full bg-pink-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 w-14 h-14"
          aria-label={isOpen ? "Close chat" : "Chat with me"}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </>
  );
}

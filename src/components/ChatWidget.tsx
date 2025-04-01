"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useVisitor } from "@/hooks/useVisitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";

const ROCKETCHAT_SERVER_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL;

interface ChatWidgetProps {
  isOpenExternal?: boolean;
  setIsOpenExternal?: (isOpen: boolean) => void;
}

export default function ChatWidget({
  isOpenExternal,
  setIsOpenExternal,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    visitor,
    isLoading: visitorLoading,
    error: visitorError,
    registerVisitor,
  } = useVisitor();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [offlineMessage, setOfflineMessage] = useState("");
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);
  const [offlineSuccess, setOfflineSuccess] = useState(false);

  // Sync with external open state if provided
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const {
    connectionState,
    messages,
    sendMessage: sendChatMessage,
    isReady,
  } = useWebSocket({
    rocketChatServerUrl: ROCKETCHAT_SERVER_URL!,
    visitor,
    isOpen,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Update external state if provided
    if (setIsOpenExternal) {
      setIsOpenExternal(newIsOpen);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = {
      name: name.trim() === "" ? "Name is required" : "",
      email:
        email.trim() === ""
          ? "Email is required"
          : !validateEmail(email)
          ? "Invalid email format"
          : "",
      message: "",
    };

    setFormErrors(errors);
    if (errors.name || errors.email) return;

    setIsSubmitting(true);
    try {
      await registerVisitor(name, email);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendChatMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = {
      name: name.trim() === "" ? "Name is required" : "",
      email:
        email.trim() === ""
          ? "Email is required"
          : !validateEmail(email)
          ? "Invalid email format"
          : "",
      message: offlineMessage.trim() === "" ? "Message is required" : "",
    };

    if (errors.name || errors.email || errors.message) {
      setFormErrors({ ...formErrors, ...errors });
      return;
    }

    setOfflineSubmitting(true);

    try {
      // Send offline message using your existing API route
      const response = await fetch("/api/sendOfflineMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          msg: offlineMessage,
          department: "Support",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOfflineSuccess(true);
          setOfflineMessage("");
        } else {
          throw new Error(data.error || "Failed to send message");
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending offline message:", error);
      setFormErrors({
        ...formErrors,
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setOfflineSubmitting(false);
    }
  };

  const handleRetryConnection = () => {
    // Reset connection state
    if (visitor) {
      // This will trigger a reconnection attempt in the useWebSocket hook
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 500);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <Card className="p-0 mb-4 w-80 sm:w-96 shadow-xl flex flex-col overflow-hidden h-[550px]">
          <CardHeader className="p-4 bg-pink-600 text-white flex flex-row justify-between items-center space-y-0">
            <CardTitle className="text-lg font-medium">
              Chat with Spruce
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs">
                {isReady && visitor && (
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                    Connected
                  </span>
                )}
                {connectionState === "connecting" && visitor && (
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></span>
                    Connecting...
                  </span>
                )}
                {connectionState === "failed" && visitor && (
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                    Disconnected
                  </span>
                )}
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {!visitor ? (
              <div className="p-4 h-full flex flex-col justify-center">
                <h4 className="text-lg font-semibold mb-4 text-center">
                  Start a Conversation
                </h4>
                <form
                  onSubmit={handleRegister}
                  className="flex flex-col gap-4 space-y-4"
                >
                  <div className=" space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className={formErrors.email ? "border-destructive" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {visitorError && (
                    <p className="text-destructive text-sm">{visitorError}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      "Start Chat"
                    )}
                  </Button>
                </form>
              </div>
            ) : connectionState === "failed" ? (
              // Offline form when connection fails
              offlineSuccess ? (
                <ScrollArea className="h-[420px] px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your message. I'll get back to you as soon as
                    possible.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setOfflineSuccess(false)}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                    <Button
                      onClick={handleRetryConnection}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      Retry Connection
                    </Button>
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-[300px] px-4 flex flex-col gap-4">
                  {" "}
                  <div className="flex flex-col items-center justify-center text-center mb-2">
                    {" "}
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full mb-2">
                      <X size={20} className="text-red-500" />
                    </div>
                    <h4 className="text-lg font-semibold">Connection Lost</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {" "}
                      I'm currently offline. Leave a message, and I'll get back
                      to you.
                    </p>
                    <Button
                      onClick={handleRetryConnection}
                      variant="outline"
                      size="sm"
                      className="mb-3"
                    >
                      <Loader2 size={16} className="mr-2" /> Retry
                    </Button>
                  </div>
                  <div className="pt-3 mt-3 border-t">
                    <h4 className="text-base font-medium mb-2 text-center">
                      Your Message
                    </h4>
                    <form
                      onSubmit={handleOfflineSubmit}
                      className="flex flex-col gap-4 space-y-2"
                    >
                      {" "}
                      <div className="space-y-1">
                        {" "}
                        <Label htmlFor="offline-message" className="text-sm">
                          {" "}
                          Message
                        </Label>
                        <Textarea
                          id="offline-message"
                          value={offlineMessage}
                          onChange={(e) => setOfflineMessage(e.target.value)}
                          placeholder="How can we help?"
                          rows={3}
                          className={cn(
                            "resize-none",
                            formErrors.message ? "border-destructive" : ""
                          )}
                        />
                        {formErrors.message && (
                          <p className="text-sm text-destructive">
                            {formErrors.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm"
                        disabled={offlineSubmitting}
                      >
                        {offlineSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          "Send"
                        )}
                      </Button>
                    </form>
                  </div>
                </ScrollArea>
              )
            ) : (
              <>
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[320px] px-4">
                    <div className="space-y-4 flex flex-col gap-2">
                      {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}

                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={cn(
                            "flex gap-2 mt-2",
                            msg.u._id === visitor._id
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          {msg.u._id !== visitor._id && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg p-3",
                              msg.u._id === visitor._id
                                ? "bg-pink-600 text-white"
                                : "bg-muted"
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.msg}
                            </p>
                            <div
                              className={cn(
                                "text-xs mt-1",
                                msg.u._id === visitor._id
                                  ? "text-pink-100"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatTime(msg.ts)}
                            </div>
                          </div>

                          {msg.u._id === visitor._id && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>
                                {visitor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-3 border-t mt-auto">
            <div className="flex w-full items-end gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="resize-none min-h-[60px] max-h-[120px]"
                disabled={!isReady}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isReady}
                className="bg-pink-600 hover:bg-pink-700 text-white h-10 w-10 flex-shrink-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <div className="fixed bottom-6 right-6">
        {isOpenExternal === undefined && (
          <Button
            onClick={toggleChat}
            className="flex items-center justify-center rounded-full bg-pink-600 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 w-14 h-14"
            aria-label={isOpen ? "Close chat" : "Chat with me"}
          >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </Button>
        )}
      </div>
    </div>
  );
}

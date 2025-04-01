"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface Visitor {
  token: string;
  _id: string;
  name?: string;
  email?: string;
}

interface ChatMessage {
  _id: string;
  msg: string;
  u: {
    _id: string;
    username: string;
    name: string;
  };
  ts: string;
}

interface UseWebSocketProps {
  rocketChatServerUrl: string;
  visitor: Visitor | null;
  isOpen: boolean;
}

type ConnectionState = "connecting" | "connected" | "failed";

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  messages: ChatMessage[];
  sendMessage: (messageText: string) => boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  isReady: boolean;
}

export function useWebSocket({
  rocketChatServerUrl,
  visitor,
  isOpen,
}: UseWebSocketProps): UseWebSocketReturn {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("failed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const subscriptionId = useRef<string | null>(null);
  const subscriptionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Remove the ping interval ref since we don't need to send pings

  // Add a new state to track connection readiness
  const [isReady, setIsReady] = useState(false);
  const connectionPromiseRef = useRef<{
    resolve: (value: boolean) => void;
    reject: (reason: any) => void;
  } | null>(null);

  const wsUrl = `${rocketChatServerUrl
    .replace("https://", "wss://")
    .replace("http://", "ws://")}/websocket`;

  const fetchRoomId = useCallback(async () => {
    if (!visitor?.token) {
      console.warn("Visitor token is missing.");
      setConnectionState("failed");
      return null;
    }

    try {
      const livechatConfigResponse = await fetch(
        `/api/getLivechatConfig?token=${visitor.token}`
      );

      if (!livechatConfigResponse.ok) {
        throw new Error(`HTTP error! status: ${livechatConfigResponse.status}`);
      }

      const livechatConfigData = await livechatConfigResponse.json();

      if (livechatConfigData.success && livechatConfigData.config?.online) {
        if (livechatConfigData.config.room?._id) {
          return livechatConfigData.config.room._id;
        } else {
          // Agent is online but no room ID, call getRoom
          const getRoomResponse = await fetch(
            `/api/getRoom?token=${visitor.token}`
          );

          if (!getRoomResponse.ok) {
            throw new Error(`HTTP error! status: ${getRoomResponse.status}`);
          }

          const getRoomData = await getRoomResponse.json();
          if (getRoomData.success && getRoomData.room?._id) {
            return getRoomData.room._id;
          } else {
            console.error("Failed to get room ID:", getRoomData);
            setConnectionState("failed");
            return null;
          }
        }
      } else {
        console.log(
          "Livechat is offline or failed to load config:",
          livechatConfigData
        );
        setConnectionState("failed");
        return null;
      }
    } catch (error) {
      console.error("Error fetching room ID:", error);
      setConnectionState("failed");
      return null;
    }
  }, [visitor?.token]);

  const sendWebSocketMessage = useCallback((message: Record<string, any>) => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Modify the connect function to return a Promise
  const connect = useCallback(async () => {
    if (
      !isOpen ||
      !visitor?.token ||
      connectionState === "connected" ||
      connectionState === "connecting"
    ) {
      return false;
    }

    setConnectionStatus("connecting");
    const fetchedRoomId = await fetchRoomId();
    if (!fetchedRoomId) {
      return false;
    }
    setRoomId(fetchedRoomId);

    // Create a new promise that will resolve when connection is ready
    const connectionPromise = new Promise<boolean>((resolve, reject) => {
      connectionPromiseRef.current = { resolve, reject };
    });

    websocketRef.current = new WebSocket(wsUrl);
    subscriptionId.current = uuidv4();

    websocketRef.current.onopen = () => {
      console.log("WebSocket opened");
      // Send the connection message
      const connectMessage = {
        msg: "connect",
        version: "1",
        support: ["1", "pre2", "pre1"],
      };
      sendWebSocketMessage(connectMessage);

      const subscribeRequest = {
        msg: "sub",
        id: subscriptionId.current,
        name: "stream-room-messages",
        params: [
          fetchedRoomId,
          {
            useCollection: false,
            args: [
              {
                visitorToken: visitor.token,
              },
            ],
          },
        ],
      };
      sendWebSocketMessage(subscribeRequest);

      // Set a timeout for subscription
      subscriptionTimeout.current = setTimeout(() => {
        if (connectionState === ("connecting" as ConnectionState)) {
          console.log("Subscription timeout reached");
          setConnectionState("failed");
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current.reject(
              new Error("Connection timeout")
            );
            connectionPromiseRef.current = null;
          }
          setIsReady(false);
        }
      }, 30000); // 30 seconds timeout
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        // Respond to ping with pong
        if (data.msg === "ping") {
          console.log("Received ping from server, sending pong");
          sendWebSocketMessage({ msg: "pong" });
        } else if (
          data.msg === "ready" &&
          data.subs?.includes(subscriptionId.current)
        ) {
          console.log("Subscription successful");
          clearTimeout(subscriptionTimeout.current!);
          setConnectionState("connected");
          setIsReady(true);

          // Resolve the connection promise
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current.resolve(true);
            connectionPromiseRef.current = null;
          }

          // Fetch message history
          fetchMessageHistory(fetchedRoomId, visitor.token);
        } else if (data.msg === "error") {
          console.error("WebSocket error:", data);
          clearTimeout(subscriptionTimeout.current!);
          setConnectionState("failed");
          setIsReady(false);

          // Reject the connection promise
          if (connectionPromiseRef.current) {
            connectionPromiseRef.current.reject(
              new Error(data.error?.message || "WebSocket error")
            );
            connectionPromiseRef.current = null;
          }
        } else if (
          data.msg === "changed" &&
          data.collection === "stream-room-messages"
        ) {
          // Handle new messages
          if (data.fields && data.fields.args && data.fields.args.length > 0) {
            const newMessage = data.fields.args[0];
            if (isValidChatMessage(newMessage)) {
              setMessages((prevMessages) => {
                // Check if message already exists
                if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
                  return [...prevMessages, newMessage];
                }
                return prevMessages;
              });
            }
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket closed");
      setConnectionState("failed");
      setIsReady(false);
      clearTimeout(subscriptionTimeout.current!);

      // Reject the connection promise if it hasn't been resolved yet
      if (connectionPromiseRef.current) {
        connectionPromiseRef.current.reject(
          new Error("WebSocket connection closed")
        );
        connectionPromiseRef.current = null;
      }
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionState("failed");
      setIsReady(false);
      clearTimeout(subscriptionTimeout.current!);

      // Reject the connection promise
      if (connectionPromiseRef.current) {
        connectionPromiseRef.current.reject(error);
        connectionPromiseRef.current = null;
      }
    };

    // Return the connection promise
    return connectionPromise;
  }, [
    rocketChatServerUrl,
    visitor,
    isOpen,
    wsUrl,
    fetchRoomId,
    sendWebSocketMessage,
  ]);

  // Modify the disconnect function to reset isReady
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    if (subscriptionTimeout.current) {
      clearTimeout(subscriptionTimeout.current);
    }

    setConnectionState("failed");
    setIsReady(false);
    setRoomId(null);

    // Reject any pending connection promise
    if (connectionPromiseRef.current) {
      connectionPromiseRef.current.reject(
        new Error("Connection manually closed")
      );
      connectionPromiseRef.current = null;
    }
  }, []);

  const fetchMessageHistory = useCallback(
    async (roomId: string, token: string) => {
      try {
        const response = await fetch(
          `/api/getMessageHistory?rid=${roomId}&token=${token}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.messages)) {
          // Filter and validate messages
          const validMessages = data.messages
            .filter((msg: any) => isValidChatMessage(msg))
            .sort(
              (
                a: { ts: string | number | Date },
                b: { ts: string | number | Date }
              ) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
            );

          console.log("Fetched message history:", validMessages);

          setMessages(validMessages);
        }
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    },
    []
  );

  const isValidChatMessage = (msg: any): msg is ChatMessage => {
    return (
      msg &&
      typeof msg === "object" &&
      "_id" in msg &&
      "msg" in msg &&
      "u" in msg &&
      typeof msg.u === "object" &&
      "_id" in msg.u &&
      "username" in msg.u &&
      "name" in msg.u &&
      "ts" in msg
    );
  };

  const setConnectionStatus = (status: ConnectionState) => {
    setConnectionState(status);
  };

  useEffect(() => {
    if (isOpen && visitor) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isOpen, visitor, connect, disconnect]);

  // Modify the sendMessage function to check isReady
  const sendMessage = useCallback(
    (messageText: string) => {
      if (!isReady || !visitor?.token || !roomId) {
        console.warn(
          "Cannot send message: Not fully connected or missing token/roomId."
        );
        return false;
      }

      const messageId = uuidv4();

      // Add message to local state immediately for better UX
      const tempMessage: ChatMessage = {
        _id: messageId,
        msg: messageText,
        u: {
          _id: visitor._id,
          username: visitor.name || "visitor",
          name: visitor.name || "Visitor",
        },
        ts: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send message via WebSocket
      const sendMessageRequest = {
        msg: "method",
        method: "sendMessageLivechat",
        params: [
          {
            _id: messageId,
            rid: roomId,
            msg: messageText,
            token: visitor.token,
          },
        ],
        id: uuidv4(),
      };

      sendWebSocketMessage(sendMessageRequest);
      return true;
    },
    [isReady, visitor, roomId, sendWebSocketMessage]
  );

  // Update the return value to include isReady
  return {
    connectionState,
    messages,
    sendMessage,
    connect,
    disconnect,
    isReady,
  };
}

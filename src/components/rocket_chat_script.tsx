"use client";

import { useEffect } from "react";

// Declare the RocketChat property on the window object
declare global {
  interface Window {
    RocketChat: any; // You can be more specific with the type if you know it
  }
}

export default function RocketChatScript() {
  useEffect(() => {
    // Check if RocketChat is already defined
    if (typeof window !== "undefined" && !window.RocketChat) {
      // Initialize RocketChat object and array as in the original script
      window.RocketChat = function (c: any) {
        // Add type to the parameter if needed
        window.RocketChat._.push(c);
      };
      window.RocketChat._ = [];
      window.RocketChat.url = "https://spruce.rocket.chat/livechat"; // Set the URL

      // Load Rocket.Chat script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src =
        "https://spruce.rocket.chat/livechat/rocketchat-livechat.min.js?_=201903270000";
      script.id = "rocket-chat-script";

      // Check if script already exists
      if (!document.getElementById("rocket-chat-script")) {
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
        } else if (document.body) {
          document.body.appendChild(script);
        }
      }
    }

    return () => {
      // Clean up script when component unmounts
      const scriptTag = document.getElementById("rocket-chat-script");
      if (scriptTag) {
        scriptTag.remove();
        delete window.RocketChat;
      }
    };
  }, []);

  return null;
}

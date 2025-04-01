"use client";

import { useState, useEffect } from "react";

export interface Visitor {
  token: string;
  _id: string;
  name: string;
  email: string;
}

interface UseVisitorReturn {
  visitor: Visitor | null;
  isLoading: boolean;
  error: string | null;
  registerVisitor: (name: string, email: string) => Promise<boolean>;
  clearVisitor: () => void;
}

export function useVisitor(): UseVisitorReturn {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if visitor data is in localStorage on mount
  useEffect(() => {
    const storedVisitor = localStorage.getItem("visitorData");
    if (storedVisitor) {
      try {
        setVisitor(JSON.parse(storedVisitor));
      } catch (err) {
        console.error("Error parsing stored visitor data:", err);
        localStorage.removeItem("visitorData");
      }
    }
    setIsLoading(false);
  }, []);

  // Generate a unique token
  const generateUniqueToken = (): string => {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
  };

  // Register visitor
  const registerVisitor = async (
    name: string,
    email: string
  ): Promise<boolean> => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    setIsLoading(true);
    setError(null);

    const token = generateUniqueToken();
    const visitorId = generateUniqueToken();

    // Create the payload for Rocket.Chat's API
    const payload = {
      visitor: {
        name,
        email,
        token,
        department: "Chat",
      },
    };

    try {
      const res = await fetch("/api/registerVisitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Registration failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        // Create a visitor object with the response data
        const newVisitor = {
          token: data.visitor.token || token,
          _id: data.visitor._id || visitorId,
          name,
          email,
        };

        // Store visitor in localStorage
        localStorage.setItem("visitorData", JSON.stringify(newVisitor));
        setVisitor(newVisitor);
        setIsLoading(false);
        return true;
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Error registering visitor:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
      setIsLoading(false);
      return false;
    }
  };

  // Clear visitor data
  const clearVisitor = () => {
    localStorage.removeItem("visitorData");
    setVisitor(null);
  };

  return { visitor, isLoading, error, registerVisitor, clearVisitor };
}

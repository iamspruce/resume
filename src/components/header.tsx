"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="header">
      <a href="#" className="logo flex gap-2 items-center">
        <img
          src="/profile_pic.png"
          alt="Spruce Emmanuel"
          className="w-8 h-8 rounded-full mr-2 object-cover border border-mauve-4"
        />
        <span className="text-xl font-semibold text-mauve-11 dark:text-mauve-12">
          Spruce
        </span>
      </a>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-mauve-3 dark:bg-mauve-4 text-mauve-11 hover:text-pink-9 border border-mauve-5 dark:border-mauve-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110 hover:-rotate-12 active:scale-95"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <Sun size={18} className="animate-spin-slow" />
        ) : (
          <Moon size={18} className="animate-pulse-slow" />
        )}
      </button>
    </header>
  );
}

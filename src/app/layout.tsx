import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import RocketChatScript from "@/components/rocket_chat_script";

export const metadata: Metadata = {
  title: "Spruce Emmanuel - Technical Documentation Specialist",
  description:
    "Personal portfolio of Spruce Emmanuel, a Technical Documentation Specialist and Technical Writer with over 7 years of experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          as="font"
          crossOrigin=""
          rel="preload"
          href="/fonts/HEX_Franklin_v0.3_Variable.woff2"
          type="font/woff2"
        />
        <link
          as="font"
          crossOrigin=""
          rel="preload"
          href="/fonts/MonoLisaVariableNormal.woff2"
          type="font/woff2"
        />
      </head>
      <body>
        {children}
        <RocketChatScript />
      </body>
    </html>
  );
}

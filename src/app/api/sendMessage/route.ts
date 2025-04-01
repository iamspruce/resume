// app/api/sendMessage/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expected body: { token: string, rid: string, msg: string }
    if (!body.token || !body.rid || !body.msg) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const response = await fetch(
      "https://spruce.rocket.chat/api/v1/livechat/message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    if (!data.success) {
      return NextResponse.json(
        { error: "Failed to send message", data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

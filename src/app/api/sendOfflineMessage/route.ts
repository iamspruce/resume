// app/api/sendOfflineMessage/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expecting payload: { name: string, email: string, msg: string, department: string }

    console.log(body);

    if (!body.name || !body.email || !body.msg) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build payload with department and host as null
    const payload = {
      name: body.name,
      email: body.email,
      message: body.msg,
      department: "Support",
      host: "null",
    };

    const response = await fetch(
      "https://spruce.rocket.chat/api/v1/livechat/offline.message",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    console.log("data", data);
    if (!data.success) {
      return NextResponse.json(
        { error: "Failed to send offline message", data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in sendOfflineMessage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/registerVisitors/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Call Rocket.Chat's visitor registration endpoint.

    const response = await fetch(
      "https://spruce.rocket.chat/api/v1/livechat/visitor",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          // Include any additional headers (e.g. auth) if required.
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    console.log("registering", data);
    if (!data.success) {
      return NextResponse.json(
        { error: "Visitor registration failed", data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in registerVisitors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rid = searchParams.get("rid");
    const token = searchParams.get("token");

    if (!rid || !token) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const ROCKETCHAT_URL =
      process.env.NEXT_PUBLIC_ROCKETCHAT_URL || "https://spruce.rocket.chat";

    const response = await fetch(
      `${ROCKETCHAT_URL}/api/v1/livechat/messages.history/${rid}?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error fetching message history:", data);
      return NextResponse.json(
        { success: false, error: data.error },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, messages: data.messages });
  } catch (error) {
    console.error("Error in getMessageHistory API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/getLivechatConfig/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";
    // Append token to the Rocket.Chat config URL
    const url = `${process.env.NEXT_PUBLIC_ROCKETCHAT_URL}/api/v1/livechat/config?token=${token}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!data.success) {
      return NextResponse.json(
        { error: "Failed to get livechat config", data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching livechat config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

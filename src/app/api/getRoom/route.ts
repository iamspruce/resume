// app/api/getRoom/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Missing visitor token" },
        { status: 400 }
      );
    }
    // Call Rocket.Chat's endpoint to retrieve (or create) a room
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROCKETCHAT_URL}/api/v1/livechat/room?token=${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log("getRoom", data);
    if (!data.success) {
      return NextResponse.json(
        { error: "Failed to retrieve room", data },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in getRoom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

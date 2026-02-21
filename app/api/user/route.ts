// app/api/users/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Attempt to connect to MongoDB
    await connectToDatabase();
    
    // 2. Attempt to fetch the users
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    
    // 3. Return the clean JSON
    return NextResponse.json(users);
  } catch (error: any) {
    // 🔥 IF ANYTHING CRASHES, WE FORCE IT TO RETURN JSON, NOT HTML!
    console.error("API Crash Log:", error);
    return NextResponse.json(
      { error: "The API crashed internally.", details: error.message }, 
      { status: 500 }
    );
  }
}

// Keeping a safe dummy POST route so it doesn't crash if you try to add a user right now
export async function POST() {
  return NextResponse.json({ error: "Temporarily disabled for debugging" }, { status: 400 });
}
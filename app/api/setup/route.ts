// app/api/setup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";

export async function GET() {
  try {
    await connectToDatabase();

    // Security Check: If a user already exists, block this script
    // This prevents anyone from hitting this URL later to create rogue admins
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup aborted. Users already exist in the database." }, 
        { status: 400 }
      );
    }

    // Generate the secure password hash
    const hashedPassword = await bcrypt.hash("DevsHook2026!", 10);

    // Inject the Master Admin
    const masterAdmin = await User.create({
      username: "admin_devshook",
      email: "admin@attirebulk.com",
      password: hashedPassword,
      role: "super_admin"
    });

    return NextResponse.json({ 
      success: true, 
      message: "🔥 Master Admin injected successfully!",
      login_credentials: {
        username: "admin_devshook",
        password: "DevsHook2026!"
      },
      next_step: "Go to http://localhost:3000/login and sign in."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
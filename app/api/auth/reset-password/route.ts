// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Find user with a valid (non-expired) reset token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "This reset link is invalid or has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash and apply new password, clear token fields
        user.password = await bcrypt.hash(password, 12);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("reset-password error:", error);
        return NextResponse.json(
            { error: "Failed to reset password.", details: error.message },
            { status: 500 }
        );
    }
}

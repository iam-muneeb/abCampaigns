import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/users — Fetch all users (excluding passwords)
export async function GET() {
    try {
        await connectToDatabase();
        const users = await User.find({}, "-password").sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        console.error("GET /api/users error:", error);
        return NextResponse.json(
            { error: "Failed to fetch users.", details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/users — Create a new user
export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { username, name, email, password, role } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "username, email, and password are all required." },
                { status: 400 }
            );
        }

        // Only super_admin can create super_admin accounts
        const session = await getServerSession(authOptions);
        const callerRole = (session?.user as any)?.role as string | undefined;
        const assignedRole = (role === "super_admin" && callerRole === "super_admin")
            ? "super_admin"
            : "admin";

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({ username, name: name || "", email, password: hashedPassword, role: assignedRole });

        // Return the new user without the password
        const { password: _pw, ...userWithoutPassword } = newUser.toObject();
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/users error:", error);

        // Handle duplicate key errors (unique constraint)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json(
                { error: `A user with that ${field} already exists.` },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create user.", details: error.message },
            { status: 500 }
        );
    }
}

// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";
import bcrypt from "bcryptjs";

// PATCH /api/users/[id] — update email and/or password (own user only)
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionUserId = (session.user as any).id;
        if (sessionUserId !== params.id) {
            return NextResponse.json(
                { error: "Forbidden: you can only edit your own account." },
                { status: 403 }
            );
        }

        const { email, password } = await req.json();
        const updates: Record<string, string> = {};

        if (email) updates.email = email;
        if (password && password.trim() !== "") {
            updates.password = await bcrypt.hash(password, 12);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update." }, { status: 400 });
        }

        await connectToDatabase();
        const updated = await User.findByIdAndUpdate(
            params.id,
            { $set: updates },
            { new: true, select: "-password" }
        );

        if (!updated) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PATCH /api/users/[id] error:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "That email is already in use." },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update user.", details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] — delete own account only
export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionUserId = (session.user as any).id;
        if (sessionUserId !== params.id) {
            return NextResponse.json(
                { error: "Forbidden: you can only delete your own account." },
                { status: 403 }
            );
        }

        await connectToDatabase();
        const deleted = await User.findByIdAndDelete(params.id);

        if (!deleted) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/users/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete user.", details: error.message },
            { status: 500 }
        );
    }
}

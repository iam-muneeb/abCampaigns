// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";
import bcrypt from "bcryptjs";

// PATCH /api/users/[id]
// super_admin → can edit any user
// admin       → can only edit their own account
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionUserId = (session.user as any).id as string;
        const sessionRole = (session.user as any).role as string;
        const isSuperAdmin = sessionRole === "super_admin";

        // Admins can only edit themselves
        if (!isSuperAdmin && sessionUserId !== id) {
            return NextResponse.json(
                { error: "Forbidden: admins can only edit their own account." },
                { status: 403 }
            );
        }

        const { email, name, password, role } = await req.json();
        const updates: Record<string, string> = {};

        if (typeof name === "string") updates.name = name;
        if (email) updates.email = email;
        if (password && password.trim() !== "") {
            updates.password = await bcrypt.hash(password, 12);
        }
        // Only super_admin can change someone's role
        if (role && isSuperAdmin) updates.role = role;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update." }, { status: 400 });
        }

        await connectToDatabase();
        const updated = await User.findByIdAndUpdate(
            id,
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
            return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to update user.", details: error.message }, { status: 500 });
    }
}

// DELETE /api/users/[id]
// super_admin → can delete any user (but not themselves)
// admin       → cannot delete any account
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessionUserId = (session.user as any).id as string;
        const sessionRole = (session.user as any).role as string;
        const isSuperAdmin = sessionRole === "super_admin";

        // Only super_admin can delete
        if (!isSuperAdmin) {
            return NextResponse.json(
                { error: "Forbidden: only super admins can delete accounts." },
                { status: 403 }
            );
        }

        await connectToDatabase();
        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/users/[id] error:", error);
        return NextResponse.json({ error: "Failed to delete user.", details: error.message }, { status: 500 });
    }
}

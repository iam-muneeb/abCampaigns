// app/api/app-versions/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import AppVersion from "@/app/models/AppVersion";

async function superAdminGuard() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized", status: 401 };
    if ((session.user as any)?.role !== "super_admin") return { error: "Forbidden: super admins only.", status: 403 };
    return null;
}

// PATCH /api/app-versions/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await superAdminGuard();
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    try {
        const { id } = await params;
        const { name, versionCode, publishDate } = await req.json();
        const updates: Record<string, any> = {};
        if (name) updates.name = name;
        if (versionCode) updates.versionCode = versionCode;
        if (publishDate) updates.publishDate = new Date(publishDate);

        await connectToDatabase();
        const updated = await AppVersion.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (!updated) return NextResponse.json({ error: "Version not found." }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error: any) {
        if (error.code === 11000) return NextResponse.json({ error: "That version code is already in use." }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/app-versions/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const guard = await superAdminGuard();
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    try {
        const { id } = await params;
        await connectToDatabase();
        const deleted = await AppVersion.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Version not found." }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

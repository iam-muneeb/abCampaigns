// app/api/campaign-types/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import CampaignType from "@/app/models/CampaignType";

// DELETE /api/campaign-types/[id] — super_admin only
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any)?.role as string;
        if (role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden: super admins only." }, { status: 403 });
        }

        await connectToDatabase();
        const deleted = await CampaignType.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Campaign type not found." }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/campaign-types/[id] — super_admin only
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any)?.role as string;
        if (role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden: super admins only." }, { status: 403 });
        }

        const { name, handle } = await req.json();
        const updates: Record<string, string> = {};
        if (name) updates.name = name;
        if (handle) updates.handle = handle;

        await connectToDatabase();
        const updated = await CampaignType.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (!updated) return NextResponse.json({ error: "Campaign type not found." }, { status: 404 });

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "That handle is already in use." }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

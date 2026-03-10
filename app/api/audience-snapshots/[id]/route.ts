// app/api/audience-snapshots/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import AudienceSnapshot from "@/app/models/AudienceSnapshot";

export const dynamic = "force-dynamic";

// DELETE /api/audience-snapshots/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectToDatabase();
        const deleted = await AudienceSnapshot.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

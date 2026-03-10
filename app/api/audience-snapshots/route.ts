// app/api/audience-snapshots/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import AudienceSnapshot from "@/app/models/AudienceSnapshot";

export const dynamic = "force-dynamic";

// GET /api/audience-snapshots — all authenticated users
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const snapshots = await AudienceSnapshot.find({}).sort({ createdAt: -1 });
        return NextResponse.json(snapshots);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/audience-snapshots — any authenticated user
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { label, filters, filterLabels, apiQuery, userCount } = body;

        if (!label?.trim()) return NextResponse.json({ error: "Label is required." }, { status: 400 });
        if (userCount === undefined || userCount === null) {
            return NextResponse.json({ error: "userCount is required." }, { status: 400 });
        }

        const user = session.user as any;
        await connectToDatabase();
        const snap = await AudienceSnapshot.create({
            label: label.trim(),
            filters: filters || {},
            filterLabels: filterLabels || [],
            apiQuery: apiQuery || "",
            userCount,
            createdBy: {
                id: user.id || "",
                name: user.name || "Unknown",
                role: user.role || "admin",
            },
        });
        return NextResponse.json(snap, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

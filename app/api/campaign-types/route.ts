// app/api/campaign-types/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import CampaignType from "@/app/models/CampaignType";

export const dynamic = "force-dynamic";

// GET /api/campaign-types — list all (any authenticated user)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const types = await CampaignType.find({}).sort({ createdAt: -1 });
        return NextResponse.json(types);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/campaign-types — create new (super_admin only)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any)?.role as string;
        if (role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden: super admins only." }, { status: 403 });
        }

        const { name, handle } = await req.json();
        if (!name || !handle) {
            return NextResponse.json({ error: "name and handle are required." }, { status: 400 });
        }

        await connectToDatabase();
        const created = await CampaignType.create({ name, handle });
        return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "A campaign type with that handle already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

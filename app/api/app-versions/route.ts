// app/api/app-versions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import AppVersion from "@/app/models/AppVersion";

export const dynamic = "force-dynamic";

// GET /api/app-versions — all authenticated users
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const versions = await AppVersion.find({}).sort({ publishDate: -1 });
        return NextResponse.json(versions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/app-versions — super_admin only
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if ((session.user as any)?.role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden: super admins only." }, { status: 403 });
        }

        const { name, versionCode, publishDate } = await req.json();
        if (!name || !versionCode || !publishDate) {
            return NextResponse.json({ error: "name, versionCode, and publishDate are required." }, { status: 400 });
        }

        await connectToDatabase();
        const created = await AppVersion.create({ name, versionCode, publishDate: new Date(publishDate) });
        return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "A version with that code already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

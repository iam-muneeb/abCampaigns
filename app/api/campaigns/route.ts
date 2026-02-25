import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectToDatabase();
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        return NextResponse.json(campaigns);
    } catch (error: any) {
        console.error("GET /api/campaigns error:", error);
        return NextResponse.json({ error: "Failed to fetch campaigns", details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();

        const { title, body: messageBody, image_url, type, audience, targetScreen } = body;

        // Validate
        if (!title || !messageBody || !type || !targetScreen) {
            return NextResponse.json({ error: "title, body, type, and targetScreen are required" }, { status: 400 });
        }

        const campaign = await Campaign.create({
            title,
            body: messageBody,
            image_url,
            type,
            audience: audience || 'All',
            targetScreen,
            status: 'Draft'
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/campaigns error:", error);
        return NextResponse.json({ error: "Failed to create campaign", details: error.message }, { status: 500 });
    }
}

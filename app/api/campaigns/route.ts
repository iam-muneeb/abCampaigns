import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN || "",
});

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

        const { name, title, body: messageBody, image_url, type, audience, targetScreen, filterParams, scheduledAt, status } = body;

        // Validate
        if (!name || !title || !messageBody || !type) {
            return NextResponse.json({ error: "name, title, body, and type are required" }, { status: 400 });
        }

        const campaign = await Campaign.create({
            name,
            title,
            body: messageBody,
            image_url,
            type,
            audience: audience || 'All',
            targetScreen: targetScreen || type,
            filterParams,
            scheduledAt,
            status: status || 'Draft'
        });

        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            
            if (status === 'Scheduled' && scheduledAt) {
                const scheduledDate = new Date(scheduledAt);
                // Calculate delay in seconds for QStash
                const delayStr = Math.max(0, Math.floor((scheduledDate.getTime() - Date.now()) / 1000));
                
                await qstashClient.publishJSON({
                    url: `${baseUrl}/api/send-campaign`,
                    body: { campaignId: campaign._id.toString() },
                    notBefore: delayStr > 0 ? delayStr : undefined,
                });
            } else if (status === 'Scheduled' || !scheduledAt) {
                campaign.status = 'Scheduled';
                await campaign.save();
                
                await qstashClient.publishJSON({
                    url: `${baseUrl}/api/send-campaign`,
                    body: { campaignId: campaign._id.toString() },
                });
            }
        } catch (queueError: any) {
            console.error("QStash error:", queueError);
            campaign.status = 'Failed';
            await campaign.save();
            return NextResponse.json({ 
                warning: "Campaign saved, but scheduling failed. Check QStash configuration.", 
                details: queueError.message 
            }, { status: 201 });
        }

        return NextResponse.json(campaign, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/campaigns error:", error.name, error.message, error.errors);
        return NextResponse.json({ error: "Failed to create campaign", details: error.message, validationErrors: error.errors }, { status: 500 });
    }
}

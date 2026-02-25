import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";
import { adminMessaging } from "@/app/lib/firebaseAdmin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const campaign = await Campaign.findById(id);

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.status === "Sending" || campaign.status === "Sent" || campaign.status === "Completed") {
            return NextResponse.json({ error: "Campaign already sent or currently sending" }, { status: 400 });
        }

        // Mark as sending
        campaign.status = "Sending";
        await campaign.save();

        // The user explicitly requested to skip topics/audiences for now
        // and send to all devices. We'll send to a generic 'all' topic.
        const topic = "all";

        const message = {
            notification: {
                title: campaign.title,
                body: campaign.body,
                ...(campaign.image_url ? { imageUrl: campaign.image_url } : {})
            },
            topic: topic,
        };

        try {
            // Send using Firebase Admin
            const response = await adminMessaging.send(message);

            campaign.status = "Sent";
            campaign.metrics.delivered = 0; // We will track via /track endpoint occasionally, but topic sends don't return deliver counts instantly
            await campaign.save();

            return NextResponse.json({ success: true, messageId: response, campaign });
        } catch (fbError: any) {
            console.error("Firebase send error:", fbError);
            campaign.status = "Failed";
            await campaign.save();
            return NextResponse.json({ error: "Failed to send notification via Firebase", details: fbError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("POST /api/campaigns/[id]/send error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

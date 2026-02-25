import { NextResponse } from "next/server";
import { adminMessaging } from "@/app/lib/firebaseAdmin";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Device FCM token is required" }, { status: 400 });
        }

        const campaign = await Campaign.findById(id);

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Split tokens by comma or space
        const tokenArray = token
            .split(/[, \n]+/)
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);

        if (tokenArray.length === 0) {
            return NextResponse.json({ error: "Valid Device FCM token(s) required" }, { status: 400 });
        }

        const message = {
            notification: {
                title: campaign.title,
                body: campaign.body,
                ...(campaign.image_url ? { imageUrl: campaign.image_url } : {})
            },
            data: {
                campaignId: String(campaign._id.toString()),
                type: String(campaign.type),
                targetScreen: String(campaign.targetScreen),
                click_action: "FLUTTER_NOTIFICATION_CLICK"
            },
            android: {
                priority: "high" as const,
                notification: {
                    sound: "default",
                    channelId: "high_importance_channel"
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        contentAvailable: true,
                    }
                }
            },
            tokens: tokenArray,
        };

        try {
            // Send to multiple exact tokens
            const response = await adminMessaging.sendEachForMulticast(message);

            return NextResponse.json({
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                method: 'token_multicast'
            });
        } catch (fbError: any) {
            console.error("Firebase send to token error:", fbError);
            return NextResponse.json({ error: "Failed to send notification to token", details: fbError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error("POST /api/campaigns/[id]/send-test error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

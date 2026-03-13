import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";
import { adminMessaging } from "@/app/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow execution up to 60s for FCM batches

async function handler(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { campaignId } = body;

        if (!campaignId) {
            return NextResponse.json({ error: "No campaignId provided" }, { status: 400 });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            console.log(`Campaign ${campaignId} not found.`);
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.status !== 'Scheduled') {
            console.log(`Campaign ${campaignId} is not Scheduled (status: ${campaign.status}). Skipping.`);
            return NextResponse.json({ message: "Skipped" });
        }

        console.log(`Processing Campaign ${campaignId}: ${campaign.title}`);
        campaign.status = 'Sending';
        await campaign.save();

        let tokens: string[] = [];
        const BASE_URL = "https://attirebulk.com/api/users.php";
        const params = new URLSearchParams();
        
        const filterParams = campaign.filterParams || {};
        const allowed = ["order", "appVersion", "itemtype", "weartype", "category", "style", "type", "os", "country"];
        for (const key of allowed) {
            const val = filterParams[key];
            if (val) params.set(key, val);
        }

        const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                tokens = data
                    .map((u: any) => u.firebaseToken)
                    .filter((t: any): t is string => typeof t === 'string' && t.trim() !== "");
            }
        } catch (err: any) {
            console.error("Failed to fetch audience tokens:", err.message);
            campaign.status = 'Failed';
            await campaign.save();
            return NextResponse.json({ error: "Failed to fetch audience" }, { status: 500 });
        }

        if (tokens.length === 0) {
            console.log(`No tokens found for campaign ${campaignId}`);
            campaign.status = 'Completed';
            campaign.metrics = { delivered: 0, opened: 0, clicks: 0 };
            await campaign.save();
            return NextResponse.json({ message: "No tokens found. Completed." });
        }

        console.log(`Found ${tokens.length} target tokens. Sending...`);

        const messagePrototype = {
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
            }
        };

        const CHUNK_SIZE = 500;
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
            const chunk = tokens.slice(i, i + CHUNK_SIZE);
            const message = {
                ...messagePrototype,
                tokens: chunk
            };

            try {
                const response = await adminMessaging.sendEachForMulticast(message);
                successCount += response.successCount;
                failureCount += response.failureCount;
            } catch (fbError: any) {
                console.error("Chunk send error:", fbError.message || fbError);
                failureCount += chunk.length;
            }
        }

        console.log(`Campaign ${campaignId} sent. Success: ${successCount}, Failures: ${failureCount}`);

        campaign.status = 'Sent';
        campaign.metrics = { ...campaign.metrics, delivered: successCount };
        await campaign.save();

        return NextResponse.json({ success: true, delivered: successCount, failed: failureCount });
    } catch (error: any) {
        console.error("QStash Receiver Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}

// Wrapping handler with Upstash Signature Verification
export const POST = verifySignatureAppRouter(handler);

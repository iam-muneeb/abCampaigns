import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";
import { campaignsQueue } from "@/app/lib/queue";

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
            // Function to add to queue with a timeout to prevent hanging if Redis is down
            const addJobWithTimeout = (jobName: string, data: any, opts: any) => {
                return Promise.race([
                    campaignsQueue.add(jobName, data, opts),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2000))
                ]);
            };

            if (status === 'Scheduled' && scheduledAt) {
                const delay = Math.max(0, new Date(scheduledAt).getTime() - Date.now());
                await addJobWithTimeout('send-campaign', { campaignId: campaign._id.toString() }, { delay });
            } else if (status === 'Scheduled' || !scheduledAt) {
                // If they clicked "Send Now", let's update status and run it immediately
                campaign.status = 'Scheduled'; // Keep worker schema happy
                await campaign.save();
                await addJobWithTimeout('send-campaign', { campaignId: campaign._id.toString() }, { delay: 0 });
            }
        } catch (queueError: any) {
            console.error("Queue error:", queueError);
            // Revert status to Failed if we couldn't queue it
            campaign.status = 'Failed';
            await campaign.save();
            return NextResponse.json({ 
                warning: "Campaign saved, but scheduling failed. Is Redis running?", 
                details: queueError.message 
            }, { status: 201 });
        }

        return NextResponse.json(campaign, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/campaigns error:", error.name, error.message, error.errors);
        return NextResponse.json({ error: "Failed to create campaign", details: error.message, validationErrors: error.errors }, { status: 500 });
    }
}

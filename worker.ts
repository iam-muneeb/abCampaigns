import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { adminMessaging } from './app/lib/firebaseAdmin';
import Campaign from './app/models/Campaign';
import dotenv from 'dotenv';
import path from 'path';

// Load from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

const worker = new Worker('campaignsQueue', async (job: Job) => {
    if (job.name === 'send-campaign') {
        await connectDB();
        const { campaignId } = job.data;
        const campaign = await Campaign.findById(campaignId);
        
        if (!campaign) {
            console.log(`Campaign ${campaignId} not found.`);
            return;
        }

        if (campaign.status !== 'Scheduled') {
            console.log(`Campaign ${campaignId} is not Scheduled (status: ${campaign.status}). Skipping.`);
            return;
        }

        console.log(`Processing Campaign ${campaignId}: ${campaign.title}`);
        
        campaign.status = 'Sending';
        await campaign.save();

        let tokens: string[] = [];

        // Fetch users using the proxy logic directly
        const BASE_URL = "https://attirebulk.com/api/users.php";
        const params = new URLSearchParams();
        
        const filterParams = campaign.filterParams || {};
        const allowed = ["order", "appVersion", "itemtype", "weartype", "category", "style", "type", "os", "country"];
        for (const key of allowed) {
            const val = filterParams[key];
            if (val) params.set(key, val);
        }

        // If audience is simply "All" or empty filters, we can just request all
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
            return;
        }

        if (tokens.length === 0) {
            console.log(`No tokens found for campaign ${campaignId}`);
            campaign.status = 'Completed';
            campaign.metrics = { delivered: 0, opened: 0, clicks: 0 };
            await campaign.save();
            return;
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
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    }
});

worker.on('ready', () => {
    console.log('Push Notification Worker is ready and listening for jobs!');
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Campaign from "@/app/models/Campaign";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        // We expect { event: "delivered" | "opened" | "clicked" }
        const { event } = await req.json();

        if (!["delivered", "opened", "clicked"].includes(event)) {
            return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
        }

        const campaign = await Campaign.findById(id);

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Increment metric
        if (event === "delivered") {
            campaign.metrics.delivered += 1;
        } else if (event === "opened") {
            campaign.metrics.opened += 1;
        } else if (event === "clicked") {
            campaign.metrics.clicks += 1;
        }

        await campaign.save();

        return NextResponse.json({ success: true, metrics: campaign.metrics });

    } catch (error: any) {
        console.error("POST /api/campaigns/[id]/track error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

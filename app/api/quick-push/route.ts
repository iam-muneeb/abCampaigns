// app/api/quick-push/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { adminMessaging } from "@/app/lib/firebaseAdmin";
import { connectToDatabase } from "@/app/lib/mongodb";
import QuickPush from "@/app/models/QuickPush";

export const dynamic = "force-dynamic";

// GET /api/quick-push — list all quick pushes, newest first
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const records = await QuickPush.find({}).sort({ createdAt: -1 });
        return NextResponse.json(records);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/quick-push — send to tokens and persist record
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, body, tokens, recipientIds } = await req.json();

        if (!title?.trim()) return NextResponse.json({ error: "title is required." }, { status: 400 });
        if (!body?.trim()) return NextResponse.json({ error: "body is required." }, { status: 400 });
        if (!Array.isArray(tokens) || tokens.length === 0) {
            return NextResponse.json({ error: "At least one FCM token is required." }, { status: 400 });
        }

        const cleanTokens: string[] = tokens
            .flatMap((t: string) => t.split(/[,\n]+/))
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);

        if (cleanTokens.length === 0) {
            return NextResponse.json({ error: "No valid FCM tokens found." }, { status: 400 });
        }

        const message = {
            notification: { title: title.trim(), body: body.trim() },
            android: {
                priority: "high" as const,
                notification: { sound: "default", channelId: "high_importance_channel" },
            },
            apns: {
                payload: { aps: { sound: "default", contentAvailable: true } },
            },
            tokens: cleanTokens,
        };

        const fbResponse = await adminMessaging.sendEachForMulticast(message);

        // Persist to DB
        const user = session.user as any;
        await connectToDatabase();
        const record = await QuickPush.create({
            title: title.trim(),
            body: body.trim(),
            recipientIds: Array.isArray(recipientIds) ? recipientIds : [],
            totalTokens: cleanTokens.length,
            successCount: fbResponse.successCount,
            failureCount: fbResponse.failureCount,
            sentBy: {
                id: user.id || "",
                name: user.name || "Unknown",
                role: user.role || "admin",
            },
        });

        return NextResponse.json({
            success: true,
            successCount: fbResponse.successCount,
            failureCount: fbResponse.failureCount,
            total: cleanTokens.length,
            record,
        });
    } catch (err: any) {
        console.error("Quick Push error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}

// app/api/quick-push/route.ts
// Sends FCM push notifications directly to a list of user FCM tokens — no campaign needed.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { adminMessaging } from "@/app/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, body, tokens } = await req.json();

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
                payload: {
                    aps: { sound: "default", contentAvailable: true },
                },
            },
            tokens: cleanTokens,
        };

        const response = await adminMessaging.sendEachForMulticast(message);

        return NextResponse.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            total: cleanTokens.length,
        });
    } catch (err: any) {
        console.error("Quick Push error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}

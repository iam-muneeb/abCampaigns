// app/api/audiences-proxy/route.ts
// Server-side proxy for attirebulk.com/api/users.php — avoids CORS
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

const BASE_URL = "https://attirebulk.com/api/users.php";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    // Forward only the filter params the upstream API actually supports
    // NOTE: The upstream API does NOT support pagination params — it returns all matching results at once
    const params = new URLSearchParams();
    const allowed = ["order", "appVersion", "itemtype", "weartype", "category", "style", "type", "os", "country"];
    for (const key of allowed) {
        const val = searchParams.get(key);
        if (val !== null && val !== "") params.set(key, val);
    }

    const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;

    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}

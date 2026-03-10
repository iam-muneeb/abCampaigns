// app/api/filters-proxy/route.ts
// Server-side proxy — fetches from attirebulk.com (no CORS) and returns data.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

const ENDPOINTS: Record<string, string> = {
    types: "https://attirebulk.com/api/types.php",
    weartypes: "https://attirebulk.com/api/weartypes.php",
    categories: "https://attirebulk.com/api/categories.php",
    styles: "https://attirebulk.com/api/styles.php",
    itemtypes: "https://attirebulk.com/api/itemtypes.php",
    countries: "https://attirebulk.com/api/countries.php",
};

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("type");
    const force = searchParams.get("force") === "true";

    if (!key || !ENDPOINTS[key]) {
        return NextResponse.json({ error: "Invalid type. Use: types | weartypes | categories | styles" }, { status: 400 });
    }

    try {
        const fetchOptions: RequestInit = force
            ? { cache: "no-store" }
            : { next: { revalidate: 300 } };

        const res = await fetch(ENDPOINTS[key], fetchOptions);
        if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 502 });
    }
}

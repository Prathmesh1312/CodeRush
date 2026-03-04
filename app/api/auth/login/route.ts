import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();
        // Verify the Firebase ID token server-side
        await adminAuth.verifyIdToken(token);

        const cookieStore = await cookies();
        cookieStore.set("coderush-auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

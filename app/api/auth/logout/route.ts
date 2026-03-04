import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.delete("coderush-auth-token");
    return NextResponse.json({ ok: true });
}

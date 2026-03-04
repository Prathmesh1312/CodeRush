import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { format } from "date-fns";

interface AttemptDoc {
    id: string;
    studentId: string;
    studentName: string;
    department: string;
    year: number;
    solvingTimeSeconds: number;
    submittedAt: string;
    eventDate: string;
}

// Called by Vercel Cron at 11:30 UTC = 5 PM IST
// Secured via CRON_SECRET authorization header
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const today = format(istDate, "yyyy-MM-dd");

    try {
        const existing = await adminDb.collection("winners").doc(today).get();
        if (existing.exists) {
            return NextResponse.json({ message: "Winner already declared", date: today });
        }

        const attemptsSnap = await adminDb
            .collection("attempts")
            .where("eventDate", "==", today)
            .orderBy("solvingTimeSeconds", "asc")
            .orderBy("submittedAt", "asc")
            .get();

        if (attemptsSnap.empty) {
            return NextResponse.json({ message: "No attempts today", date: today });
        }

        const map = new Map<string, AttemptDoc>();
        attemptsSnap.docs.forEach((d) => {
            const a = { id: d.id, ...d.data() } as AttemptDoc;
            const cur = map.get(a.studentId);
            if (
                !cur ||
                a.solvingTimeSeconds < cur.solvingTimeSeconds ||
                (a.solvingTimeSeconds === cur.solvingTimeSeconds && a.submittedAt < cur.submittedAt)
            ) {
                map.set(a.studentId, a);
            }
        });

        const best = Array.from(map.values()).sort(
            (a, b) =>
                a.solvingTimeSeconds - b.solvingTimeSeconds ||
                a.submittedAt.localeCompare(b.submittedAt)
        )[0];

        await adminDb.collection("winners").doc(today).set({
            studentId: best.studentId,
            studentName: best.studentName,
            department: best.department,
            year: best.year,
            attemptId: best.id,
            solvingTimeSeconds: best.solvingTimeSeconds,
            submittedAt: best.submittedAt,
            declaredAt: new Date().toISOString(),
            eventDate: today,
        });

        return NextResponse.json({
            message: "Winner declared",
            winner: best.studentName,
            time: best.solvingTimeSeconds,
            date: today,
        });
    } catch (err) {
        console.error("Cron error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

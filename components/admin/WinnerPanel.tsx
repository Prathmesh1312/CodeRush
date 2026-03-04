"use client";

import { useState, useEffect } from "react";
import {
    collection, query, where, getDocs, setDoc, doc, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Attempt, Winner } from "@/lib/firebase/firestore";
import { formatTime, todayDate, formatDisplayDate } from "@/lib/utils";
import { Trophy, Crown, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function WinnerPanel() {
    const [date, setDate] = useState(todayDate());
    const [winner, setWinner] = useState<Winner | null>(null);
    const [loading, setLoading] = useState(false);
    const [declaring, setDeclaring] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "winners", date), (snap) => {
            setWinner(snap.exists() ? ({ id: snap.id, ...snap.data() } as Winner) : null);
        });
        return () => unsub();
    }, [date]);

    const declareWinner = async () => {
        setDeclaring(true);
        try {
            const q = query(
                collection(db, "attempts"),
                where("eventDate", "==", date)
            );
            const snap = await getDocs(q);
            if (snap.empty) { toast.error("No attempts recorded for this date"); setDeclaring(false); return; }

            // Best attempt per student → pick overall best
            const map = new Map<string, Attempt & { id: string }>();
            snap.docs.forEach((d) => {
                const a = { id: d.id, ...d.data() } as Attempt & { id: string };
                const existing = map.get(a.studentId);
                if (
                    !existing ||
                    a.solvingTimeSeconds < existing.solvingTimeSeconds ||
                    (a.solvingTimeSeconds === existing.solvingTimeSeconds && a.submittedAt < existing.submittedAt)
                ) {
                    map.set(a.studentId, a);
                }
            });

            const best = Array.from(map.values()).sort(
                (a, b) => a.solvingTimeSeconds - b.solvingTimeSeconds || a.submittedAt.localeCompare(b.submittedAt)
            )[0];

            await setDoc(doc(db, "winners", date), {
                studentId: best.studentId,
                studentName: best.studentName,
                department: best.department,
                year: best.year,
                attemptId: best.id,
                solvingTimeSeconds: best.solvingTimeSeconds,
                submittedAt: best.submittedAt,
                declaredAt: new Date().toISOString(),
                eventDate: date,
            } as Winner);

            toast.success(`🏆 Winner declared: ${best.studentName}`);
        } catch (err) {
            toast.error("Error declaring winner");
            console.error(err);
        } finally {
            setDeclaring(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Trophy size={18} className="text-brand-400" /> Winner Declaration
                    </h2>
                    <input
                        type="date"
                        className="form-input text-sm w-auto"
                        style={{ colorScheme: "dark" }}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {winner ? (
                    <div className="bg-brand-900/20 border border-brand-700/40 rounded-xl p-6 text-center">
                        <Crown size={36} className="text-amber-400 mx-auto mb-3" />
                        <p className="text-xs text-brand-400 uppercase tracking-widest mb-1">Winner</p>
                        <h3 className="text-3xl font-black text-white mb-1">{winner.studentName}</h3>
                        <p className="text-gray-400">{winner.department} · Year {winner.year}</p>
                        <div className="mt-4 inline-block bg-dark-800 rounded-xl px-6 py-3">
                            <p className="text-xs text-gray-500 mb-0.5">Solving Time</p>
                            <p className="text-3xl font-black font-mono text-brand-400">
                                {formatTime(winner.solvingTimeSeconds)}
                            </p>
                        </div>
                        <p className="text-gray-600 text-xs mt-3">
                            Declared at {new Date(winner.declaredAt).toLocaleString("en-IN")}
                        </p>
                    </div>
                ) : (
                    <div className="border border-dashed border-gray-700 rounded-xl p-10 text-center">
                        <Trophy size={40} className="text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">No winner declared for {formatDisplayDate(date)}</p>
                        <p className="text-gray-700 text-xs">
                            Auto-declaration happens at 5 PM IST, or you can trigger it manually below.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={declareWinner}
                        disabled={declaring}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                        <Crown size={16} />
                        {declaring ? "Declaring..." : winner ? "Re-declare Winner" : "Declare Winner Now"}
                    </button>
                    {winner && (
                        <p className="flex items-center gap-2 text-amber-500/80 text-xs">
                            <AlertTriangle size={12} /> Re-declaring will overwrite the current winner.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { todayDate, formatTime } from "@/lib/utils";
import { Users, Clock, Trophy, Activity, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const today = todayDate();
    const [stats, setStats] = useState({ participants: 0, attempts: 0, bestTime: 0, bestName: "" });

    useEffect(() => {
        const q = query(collection(db, "attempts"), where("eventDate", "==", today));
        const unsub = onSnapshot(q, (snap) => {
            const attempts = snap.docs.map((d) => d.data() as { studentId: string; solvingTimeSeconds: number; studentName: string; submittedAt: string });
            const uniqueStudents = new Set(attempts.map((a) => a.studentId)).size;
            const best = attempts.sort(
                (a, b) => a.solvingTimeSeconds - b.solvingTimeSeconds || a.submittedAt.localeCompare(b.submittedAt)
            )[0];
            setStats({
                participants: uniqueStudents,
                attempts: attempts.length,
                bestTime: best?.solvingTimeSeconds || 0,
                bestName: best?.studentName || "—",
            });
        });
        return () => unsub();
    }, [today]);

    const statCards = [
        { label: "Participants Today", value: stats.participants, icon: Users, color: "text-brand-400", bg: "bg-brand-600/10 border-brand-700/30" },
        { label: "Total Attempts", value: stats.attempts, icon: Activity, color: "text-purple-400", bg: "bg-purple-600/10 border-purple-700/30" },
        { label: "Best Time Today", value: stats.bestTime ? formatTime(stats.bestTime) : "—", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-600/10 border-emerald-700/30" },
        { label: "Current Leader", value: stats.bestName, icon: Trophy, color: "text-amber-400", bg: "bg-amber-600/10 border-amber-700/30" },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Today · {today}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s) => (
                    <div key={s.label} className={`glass rounded-xl p-5 border ${s.bg} animate-fade-in`}>
                        <s.icon size={20} className={s.color + " mb-3"} />
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-white truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {[
                    { href: "/admin/students", label: "Manage Students", desc: "Add students to the event", icon: Users },
                    { href: "/admin/attempts", label: "Record Attempt", desc: "Log a student's solving time", icon: Clock },
                    { href: "/admin/questions", label: "Manage Questions", desc: "Add or toggle today's question", icon: Activity },
                    { href: "/admin/winner", label: "Declare Winner", desc: "Declare the day's winner", icon: Trophy },
                ].map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="glass rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-brand-700/40 hover:bg-brand-600/5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                            <card.icon size={18} className="text-brand-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium">{card.label}</p>
                            <p className="text-gray-500 text-sm">{card.desc}</p>
                        </div>
                        <ExternalLink size={14} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

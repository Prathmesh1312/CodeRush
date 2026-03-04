"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Attempt, Winner } from "@/lib/firebase/firestore";
import { formatTime, todayDate } from "@/lib/utils";
import WinnerBanner from "./WinnerBanner";
import DateFilter from "./DateFilter";
import LiveBadge from "./LiveBadge";
import { Trophy, User, Clock, Hash, Calendar, Medal } from "lucide-react";

interface RankedEntry {
    studentId: string;
    studentName: string;
    department: string;
    year: number;
    bestTimeSeconds: number;
    bestSubmittedAt: string;
    totalAttempts: number;
    rank: number;
}

interface LeaderboardTableProps {
    initialDate: string;
}

export default function LeaderboardTable({ initialDate }: LeaderboardTableProps) {
    const [date, setDate] = useState(initialDate);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [winner, setWinner] = useState<Winner | null>(null);
    const [loading, setLoading] = useState(true);

    // Real-time listener for attempts
    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "attempts"),
            where("eventDate", "==", date)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Attempt[];
            setAttempts(data);
            setLoading(false);
        });

        return () => unsub();
    }, [date]);

    // Real-time listener for winner
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "winners"), (snapshot) => {
            const winnerDoc = snapshot.docs.find((d) => d.id === date);
            if (winnerDoc) {
                setWinner({ id: winnerDoc.id, ...winnerDoc.data() } as Winner);
            } else {
                setWinner(null);
            }
        });
        return () => unsub();
    }, [date]);

    // Build ranked leaderboard
    const ranked: RankedEntry[] = (() => {
        const map = new Map<string, RankedEntry>();
        for (const a of attempts) {
            const existing = map.get(a.studentId);
            if (
                !existing ||
                a.solvingTimeSeconds < existing.bestTimeSeconds ||
                (a.solvingTimeSeconds === existing.bestTimeSeconds &&
                    a.submittedAt < existing.bestSubmittedAt)
            ) {
                map.set(a.studentId, {
                    studentId: a.studentId,
                    studentName: a.studentName,
                    department: a.department,
                    year: a.year,
                    bestTimeSeconds: a.solvingTimeSeconds,
                    bestSubmittedAt: a.submittedAt,
                    totalAttempts: (existing?.totalAttempts || 0) + 1,
                    rank: 0,
                });
            } else if (existing) {
                existing.totalAttempts += 1;
            }
        }
        return Array.from(map.values())
            .sort(
                (a, b) =>
                    a.bestTimeSeconds - b.bestTimeSeconds ||
                    a.bestSubmittedAt.localeCompare(b.bestSubmittedAt)
            )
            .map((e, i) => ({ ...e, rank: i + 1 }));
    })();

    const isToday = date === todayDate();

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
            {winner && <WinnerBanner winner={winner} />}

            {/* Header */}
            <header className="border-b border-gray-800/60 bg-dark-800/80 backdrop-blur sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">CodeZest</h1>
                            <p className="text-xs text-gray-500">IEEE Competitive Coding Event</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {isToday && <LiveBadge />}
                        <DateFilter value={date} onChange={setDate} />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Participants", value: ranked.length, icon: User, color: "text-brand-400" },
                        {
                            label: "Total Attempts",
                            value: attempts.length,
                            icon: Hash,
                            color: "text-purple-400",
                        },
                        {
                            label: "Best Time",
                            value: ranked[0] ? formatTime(ranked[0].bestTimeSeconds) : "—",
                            icon: Clock,
                            color: "text-emerald-400",
                        },
                        {
                            label: "Event Date",
                            value: date,
                            icon: Calendar,
                            color: "text-amber-400",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="glass rounded-xl p-4 flex items-center gap-3 animate-fade-in"
                        >
                            <stat.icon size={20} className={stat.color} />
                            <div>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <p className="text-lg font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leaderboard table */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800/60 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Medal size={18} className="text-brand-400" /> Live Rankings
                        </h2>
                        <span className="text-xs text-gray-500">{ranked.length} students</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : ranked.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Trophy size={40} className="text-gray-700" />
                            <p className="text-gray-500 text-sm">No attempts recorded yet for this date.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800/60">
                                        <th className="px-6 py-3 text-left">Rank</th>
                                        <th className="px-6 py-3 text-left">Student</th>
                                        <th className="px-6 py-3 text-left hidden sm:table-cell">Department</th>
                                        <th className="px-6 py-3 text-left hidden md:table-cell">Year</th>
                                        <th className="px-6 py-3 text-left">Best Time</th>
                                        <th className="px-6 py-3 text-left hidden sm:table-cell">Attempts</th>
                                        <th className="px-6 py-3 text-left hidden lg:table-cell">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranked.map((entry) => (
                                        <tr
                                            key={entry.studentId}
                                            className="lb-row border-b border-gray-800/30 last:border-0"
                                        >
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`text-2xl font-black ${entry.rank === 1
                                                        ? "rank-1"
                                                        : entry.rank === 2
                                                            ? "rank-2"
                                                            : entry.rank === 3
                                                                ? "rank-3"
                                                                : "text-gray-600"
                                                        }`}
                                                >
                                                    {entry.rank === 1
                                                        ? "🥇"
                                                        : entry.rank === 2
                                                            ? "🥈"
                                                            : entry.rank === 3
                                                                ? "🥉"
                                                                : `#${entry.rank}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-white">{entry.studentName}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                                                {entry.department}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                                                Year {entry.year}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-brand-400 bg-brand-900/20 px-3 py-1 rounded-lg">
                                                    {formatTime(entry.bestTimeSeconds)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                                                {entry.totalAttempts}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                                                {new Date(entry.bestSubmittedAt).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <footer className="text-center py-6 text-gray-700 text-xs">
                IEEE CodeZest &copy; {new Date().getFullYear()} — Powered by real-time data
            </footer>
        </div>
    );
}

"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Winner } from "@/lib/firebase/firestore";
import { formatTime, formatDisplayDate } from "@/lib/utils";
import { Trophy, Star } from "lucide-react";

interface WinnerBannerProps {
    winner: Winner;
}

export default function WinnerBanner({ winner }: WinnerBannerProps) {
    const fired = useRef(false);

    useEffect(() => {
        if (!fired.current) {
            fired.current = true;
            const end = Date.now() + 3500;
            const colors = ["#3b82f6", "#60a5fa", "#fbbf24", "#f59e0b", "#a78bfa"];
            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors,
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors,
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 winner-overlay flex items-center justify-center px-4">
            <div className="glass rounded-3xl p-10 text-center max-w-lg w-full animate-slide-up shadow-2xl border border-brand-700/40">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center animate-glow">
                            <Trophy size={44} className="text-brand-400" />
                        </div>
                        <Star
                            size={20}
                            className="absolute -top-2 -right-2 text-amber-400 animate-pulse"
                            fill="currentColor"
                        />
                    </div>
                </div>

                <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">
                    🏆 Winner of {formatDisplayDate(winner.eventDate)}
                </p>
                <h2 className="text-4xl font-black text-white mb-1">{winner.studentName}</h2>
                <p className="text-gray-400 text-lg mb-6">
                    {winner.department} · Year {winner.year}
                </p>

                <div className="bg-dark-800 rounded-2xl px-8 py-5 inline-block">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Solving Time</p>
                    <p className="text-5xl font-black font-mono text-brand-400">
                        {formatTime(winner.solvingTimeSeconds)}
                    </p>
                </div>

                <p className="text-gray-600 text-xs mt-6">
                    Declared at{" "}
                    {new Date(winner.declaredAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </div>
    );
}

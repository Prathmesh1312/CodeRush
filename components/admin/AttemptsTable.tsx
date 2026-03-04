"use client";

import { useEffect, useState } from "react";
import {
    collection, query, where, onSnapshot, deleteDoc, doc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Attempt } from "@/lib/firebase/firestore";
import { formatTime, todayDate } from "@/lib/utils";
import { Trash2, Download, List } from "lucide-react";
import toast from "react-hot-toast";

export default function AttemptsTable() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [date, setDate] = useState(todayDate());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "attempts"),
            where("eventDate", "==", date)
        );
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Attempt));
            // Sort client-side: newest first
            data.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
            setAttempts(data);
            setLoading(false);
        });
        return () => unsub();
    }, [date]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this attempt?")) return;
        await deleteDoc(doc(db, "attempts", id));
        toast.success("Attempt deleted");
    };

    const handleExport = () => {
        const rows = [
            ["Student", "Department", "Year", "Time (s)", "Formatted Time", "Attempt #", "Submitted At", "Date"],
            ...attempts.map((a) => [
                a.studentName, a.department, a.year,
                a.solvingTimeSeconds, formatTime(a.solvingTimeSeconds),
                a.attemptNumber, a.submittedAt, a.eventDate,
            ]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `coderush-attempts-${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported!");
    };

    return (
        <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <List size={18} className="text-brand-400" /> Attempts
                </h2>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-input text-sm w-auto"
                        style={{ colorScheme: "dark" }}
                    />
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : attempts.length === 0 ? (
                <div className="text-center py-16 text-gray-600 text-sm">No attempts recorded for {date}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                                {["Student", "Dept", "Year", "Time", "Attempt #", "Submitted", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((a) => (
                                <tr key={a.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{a.studentName}</td>
                                    <td className="px-4 py-3 text-gray-400">{a.department}</td>
                                    <td className="px-4 py-3 text-gray-400">Y{a.year}</td>
                                    <td className="px-4 py-3 font-mono font-bold text-brand-400">
                                        {formatTime(a.solvingTimeSeconds)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">#{a.attemptNumber}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(a.submittedAt).toLocaleTimeString("en-IN")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(a.id!)}
                                            className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

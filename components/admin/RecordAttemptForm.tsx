"use client";

import { useState, useEffect } from "react";
import {
    collection, addDoc, getDocs, query, where, orderBy, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Student, Attempt } from "@/lib/firebase/firestore";
import { parseTimeToSeconds, formatTime, todayDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Clock, StopCircle } from "lucide-react";

export default function RecordAttemptForm() {
    const [students, setStudents] = useState<Student[]>([]);
    const [studentId, setStudentId] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, "students"), orderBy("name")),
            (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
        );
        return () => unsub();
    }, []);

    // Timer logic
    useEffect(() => {
        if (!timerActive) return;
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - timerStart!) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [timerActive, timerStart]);

    const startTimer = () => {
        setTimerStart(Date.now());
        setElapsed(0);
        setTimerActive(true);
        setTimeInput("");
    };

    const stopTimer = () => {
        setTimerActive(false);
        setTimeInput(String(elapsed));
    };

    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) { toast.error("Select a student"); return; }
        const secs = parseTimeToSeconds(timeInput);
        if (!secs) { toast.error("Enter a valid time"); return; }

        const student = students.find((s) => s.id === studentId)!;
        const today = todayDate();

        setLoading(true);
        try {
            // Count existing attempts for this student today
            const existingSnap = await getDocs(
                query(
                    collection(db, "attempts"),
                    where("studentId", "==", studentId),
                    where("eventDate", "==", today)
                )
            );
            const attemptNumber = existingSnap.size + 1;

            await addDoc(collection(db, "attempts"), {
                studentId,
                studentName: student.name,
                department: student.department,
                year: student.year,
                questionId: "",
                solvingTimeSeconds: secs,
                attemptNumber,
                submittedAt: new Date().toISOString(),
                eventDate: today,
            } as Attempt);

            toast.success(`Recorded ${formatTime(secs)} for ${student.name} (attempt #${attemptNumber})`);
            setStudentId("");
            setTimeInput("");
            setSearch("");
        } catch (err) {
            toast.error("Failed to record attempt");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Clock size={18} className="text-brand-400" /> Record Attempt
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student search */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Search Student</label>
                    <input
                        className="form-input mb-2"
                        placeholder="Type name or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="form-input"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        size={4}
                    >
                        <option value="" style={{ background: "#111827" }}>-- Select --</option>
                        {filteredStudents.map((s) => (
                            <option key={s.id} value={s.id} style={{ background: "#111827" }}>
                                {s.name} · {s.department} · Y{s.year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Timer */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Solving Time</label>
                    <div className="flex gap-2 mb-2">
                        {!timerActive ? (
                            <button
                                type="button"
                                onClick={startTimer}
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                <Clock size={14} /> Start Timer
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopTimer}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
                            >
                                <StopCircle size={14} /> Stop — {formatTime(elapsed)}
                            </button>
                        )}
                    </div>
                    <input
                        className="form-input"
                        placeholder="Or type: 1:30 or 90 or 1m30s"
                        value={timerActive ? formatTime(elapsed) : timeInput}
                        onChange={(e) => { if (!timerActive) setTimeInput(e.target.value); }}
                        readOnly={timerActive}
                    />
                    {timeInput && !timerActive && (
                        <p className="text-xs text-brand-400 mt-1">
                            = {formatTime(parseTimeToSeconds(timeInput))}
                        </p>
                    )}
                </div>

                <button type="submit" disabled={loading || timerActive} className="btn-primary w-full">
                    {loading ? "Recording..." : "Record Attempt"}
                </button>
            </form>
        </div>
    );
}

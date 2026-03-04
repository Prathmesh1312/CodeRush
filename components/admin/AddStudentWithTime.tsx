"use client";

import { useState, useEffect } from "react";
import {
    collection, addDoc, getDocs, query, where, orderBy, onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Student } from "@/lib/firebase/firestore";
import { parseTimeToSeconds, formatTime, todayDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { UserPlus, Clock, StopCircle, CheckCircle2 } from "lucide-react";

const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "CSD", "IOT", "Other"];

type Mode = "new" | "existing";

export default function AddStudentWithTime() {
    const [mode, setMode] = useState<Mode>("new");

    // New student fields
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("CSE");
    const [year, setYear] = useState("1");

    // Existing student
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");

    // Time fields
    const [timeInput, setTimeInput] = useState("");
    const [timerActive, setTimerActive] = useState(false);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const [loading, setLoading] = useState(false);

    // Load existing students
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, "students"), orderBy("name")),
            (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
        );
        return () => unsub();
    }, []);

    // Timer tick
    useEffect(() => {
        if (!timerActive) return;
        const iv = setInterval(() => setElapsed(Math.floor((Date.now() - timerStart!) / 1000)), 1000);
        return () => clearInterval(iv);
    }, [timerActive, timerStart]);

    const startTimer = () => { setTimerStart(Date.now()); setElapsed(0); setTimerActive(true); setTimeInput(""); };
    const stopTimer = () => { setTimerActive(false); setTimeInput(String(elapsed)); };

    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.department.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const secs = parseTimeToSeconds(timeInput);
        if (!secs) { toast.error("Enter a valid solving time"); return; }

        setLoading(true);
        try {
            const today = todayDate();
            let studentId = selectedStudentId;
            let studentData: { name: string; department: string; year: number };

            if (mode === "new") {
                if (!name.trim()) { toast.error("Enter student name"); setLoading(false); return; }
                // Create the student
                const ref = await addDoc(collection(db, "students"), {
                    name: name.trim(), department, year: parseInt(year),
                    createdAt: new Date().toISOString(),
                });
                studentId = ref.id;
                studentData = { name: name.trim(), department, year: parseInt(year) };
            } else {
                const student = students.find((s) => s.id === studentId);
                if (!student) { toast.error("Select a student"); setLoading(false); return; }
                studentData = { name: student.name, department: student.department, year: student.year };
            }

            // Count previous attempts today
            const prevSnap = await getDocs(
                query(
                    collection(db, "attempts"),
                    where("studentId", "==", studentId),
                    where("eventDate", "==", today)
                )
            );
            const attemptNumber = prevSnap.size + 1;

            // Record the attempt
            await addDoc(collection(db, "attempts"), {
                studentId,
                studentName: studentData.name,
                department: studentData.department,
                year: studentData.year,
                questionId: "",
                solvingTimeSeconds: secs,
                attemptNumber,
                submittedAt: new Date().toISOString(),
                eventDate: today,
            });

            toast.success(
                `✅ Recorded ${formatTime(secs)} for ${studentData.name} (attempt #${attemptNumber})`
            );

            // Reset form
            setName(""); setDepartment("CSE"); setYear("1");
            setSelectedStudentId(""); setSearch("");
            setTimeInput(""); setElapsed(0);
        } catch (err) {
            toast.error("Failed to save");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-brand-400" /> Add Student & Record Time
            </h2>

            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6 w-fit">
                {(["new", "existing"] as Mode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-5 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {m === "new" ? "New Student" : "Existing Student"}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "new" ? (
                    <>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Full Name *</label>
                            <input className="form-input" placeholder="e.g. Prathmesh Toke" value={name}
                                onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Department</label>
                                <select className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d} style={{ background: "#1f2937" }}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Year</label>
                                <select className="form-input" value={year} onChange={(e) => setYear(e.target.value)}>
                                    {[1, 2, 3, 4].map((y) => <option key={y} value={y} style={{ background: "#1f2937" }}>Year {y}</option>)}
                                </select>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Search & Select Student</label>
                        <input className="form-input mb-2" placeholder="Search by name or dept..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                        <select className="form-input" value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)} size={4}>
                            <option value="" style={{ background: "#111827" }}>-- Select student --</option>
                            {filteredStudents.map((s) => (
                                <option key={s.id} value={s.id} style={{ background: "#111827" }}>
                                    {s.name} · {s.department} · Y{s.year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Timer + time input */}
                <div className="border-t border-gray-800 pt-4">
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                        <Clock size={12} /> Solving Time
                    </label>
                    <div className="flex gap-2 mb-2">
                        {!timerActive ? (
                            <button type="button" onClick={startTimer}
                                className="btn-primary flex items-center gap-2 text-sm">
                                <Clock size={14} /> Start Timer
                            </button>
                        ) : (
                            <button type="button" onClick={stopTimer}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all">
                                <StopCircle size={14} /> Stop — {formatTime(elapsed)}
                            </button>
                        )}
                    </div>
                    <input
                        className="form-input"
                        placeholder="Or type: 1:30  or  90  or  1m30s"
                        value={timerActive ? formatTime(elapsed) : timeInput}
                        onChange={(e) => { if (!timerActive) setTimeInput(e.target.value); }}
                        readOnly={timerActive}
                    />
                    {timeInput && !timerActive && (
                        <p className="text-xs text-brand-400 mt-1">= {formatTime(parseTimeToSeconds(timeInput))}</p>
                    )}
                </div>

                <button type="submit" disabled={loading || timerActive} className="btn-primary w-full py-3">
                    {loading ? "Saving..." : mode === "new" ? "Add Student & Record Time" : "Record Time"}
                </button>
            </form>
        </div>
    );
}

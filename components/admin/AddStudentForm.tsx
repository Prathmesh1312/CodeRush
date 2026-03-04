"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "CSD", "IOT", "Other"];

export default function AddStudentForm() {
    const [form, setForm] = useState({ name: "", department: "CSE", year: "1" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        setLoading(true);
        try {
            await addDoc(collection(db, "students"), {
                name: form.name.trim(),
                department: form.department,
                year: parseInt(form.year),
                createdAt: new Date().toISOString(),
            });
            toast.success(`${form.name} added!`);
            setForm({ name: "", department: "CSE", year: "1" });
        } catch (err) {
            toast.error("Failed to add student");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <UserPlus size={18} className="text-brand-400" /> Add New Student
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input
                        className="form-input"
                        placeholder="e.g. Prathmesh Toke"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Department</label>
                        <select
                            className="form-input"
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                        >
                            {DEPARTMENTS.map((d) => (
                                <option key={d} value={d} style={{ background: "#1f2937" }}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Year</label>
                        <select
                            className="form-input"
                            value={form.year}
                            onChange={(e) => setForm({ ...form, year: e.target.value })}
                        >
                            {[1, 2, 3, 4].map((y) => (
                                <option key={y} value={y} style={{ background: "#1f2937" }}>Year {y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? "Adding..." : "Add Student"}
                </button>
            </form>
        </div>
    );
}

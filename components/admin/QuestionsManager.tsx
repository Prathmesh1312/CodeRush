"use client";

import { useState, useEffect } from "react";
import {
    collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, orderBy, query
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Question } from "@/lib/firebase/firestore";
import { todayDate } from "@/lib/utils";
import { HelpCircle, Trash2, ToggleLeft, ToggleRight, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function QuestionsManager() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [form, setForm] = useState({ title: "", description: "", eventDate: todayDate() });
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) =>
            setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question)))
        );
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Title required"); return; }
        setLoading(true);
        try {
            await addDoc(collection(db, "questions"), {
                ...form,
                isActive: false,
                createdAt: new Date().toISOString(),
            });
            toast.success("Question added");
            setForm({ title: "", description: "", eventDate: todayDate() });
            setAdding(false);
        } finally { setLoading(false); }
    };

    const toggleActive = async (q: Question) => {
        await updateDoc(doc(db, "questions", q.id!), { isActive: !q.isActive });
        toast.success(q.isActive ? "Deactivated" : "Activated");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete question?")) return;
        await deleteDoc(doc(db, "questions", id));
        toast.success("Deleted");
    };

    return (
        <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HelpCircle size={18} className="text-brand-400" /> Questions
                </h2>
                <button onClick={() => setAdding(!adding)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {adding && (
                <form onSubmit={handleAdd} className="p-6 border-b border-gray-800 space-y-4 bg-dark-800/40">
                    <input
                        className="form-input"
                        placeholder="Question title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                        className="form-input min-h-[80px] resize-y"
                        placeholder="Description (optional)"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Event Date</label>
                            <input
                                type="date"
                                className="form-input"
                                style={{ colorScheme: "dark" }}
                                value={form.eventDate}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" disabled={loading} className="btn-primary">Save</button>
                            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </form>
            )}

            <div className="divide-y divide-gray-800/40">
                {questions.length === 0 && (
                    <div className="text-center py-12 text-gray-600 text-sm">No questions yet</div>
                )}
                {questions.map((q) => (
                    <div key={q.id} className="px-6 py-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.isActive
                                            ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/40"
                                            : "bg-gray-800 text-gray-500"
                                        }`}
                                >
                                    {q.isActive ? "Active" : "Inactive"}
                                </span>
                                <span className="text-xs text-gray-600">{q.eventDate}</span>
                            </div>
                            <p className="text-white font-medium">{q.title}</p>
                            {q.description && <p className="text-gray-500 text-sm mt-0.5">{q.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => toggleActive(q)} className="text-gray-500 hover:text-brand-400 transition-colors">
                                {q.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                            </button>
                            <button onClick={() => handleDelete(q.id!)} className="text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

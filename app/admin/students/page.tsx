"use client";

import AddStudentWithTime from "@/components/admin/AddStudentWithTime";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Student } from "@/lib/firebase/firestore";
import { Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) =>
            setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student)))
        );
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Students</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {students.length} registered · Add a new student and record their solving time in one step
                </p>
            </div>

            {/* Combined add + record form */}
            <AddStudentWithTime />

            {/* Student list */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                    <Users size={16} className="text-brand-400" />
                    <span className="text-sm font-medium text-white">All Students</span>
                    <span className="text-xs text-gray-600 ml-auto">{students.length} total</span>
                </div>
                {students.length === 0 ? (
                    <div className="text-center py-12 text-gray-600 text-sm">No students yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Dept</th>
                                    <th className="px-4 py-3 text-left">Year</th>
                                    <th className="px-4 py-3 text-left"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-gray-400">{s.department}</td>
                                        <td className="px-4 py-3 text-gray-400">Year {s.year}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Delete student?")) return;
                                                    await deleteDoc(doc(db, "students", s.id!));
                                                    toast.success("Student removed");
                                                }}
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
        </div>
    );
}

"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Trophy, Lock, Mail, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const token = await cred.user.getIdToken();
            // Set auth cookie via API route
            await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            toast.success("Welcome back!");
            router.push("/admin");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Invalid credentials";
            toast.error(msg.includes("password") || msg.includes("user") ? "Invalid email or password" : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "var(--bg-primary)" }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 animate-glow">
                        <Trophy size={30} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CodeZest</h1>
                    <p className="text-gray-500 mt-1">Admin Portal · IEEE</p>
                </div>

                <div className="glass rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Lock size={18} className="text-brand-400" /> Admin Login
                    </h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                <Mail size={12} /> Email
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@ieee.org"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                <Lock size={12} /> Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    className="form-input pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-700 text-xs mt-6">
                    Not an admin? <a href="/leaderboard" className="text-brand-500 hover:underline">View Leaderboard →</a>
                </p>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Clock,
    HelpCircle,
    Trophy,
    Menu,
    X,
    LogOut,
    ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/attempts", label: "Attempts", icon: Clock },
    { href: "/admin/questions", label: "Questions", icon: HelpCircle },
    { href: "/admin/winner", label: "Winner", icon: Trophy },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Logged out");
        router.push("/admin/login");
    };

    const isActive = (href: string, exact = false) =>
        exact ? pathname === href : pathname.startsWith(href);

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                        <Trophy size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">CodeZest</p>
                        <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                            isActive(item.href, item.exact)
                                ? "bg-brand-600/20 text-brand-400 border border-brand-700/40"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        )}
                    >
                        <item.icon size={16} />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/leaderboard"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                    <ExternalLink size={16} /> View Leaderboard
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-all"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-60 flex-col admin-sidebar min-h-screen">
                <NavContent />
            </aside>

            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-dark-800 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-brand-400" />
                    <span className="text-sm font-bold text-white">CodeZest Admin</span>
                </div>
                <button onClick={() => setOpen(true)} className="p-2 text-gray-400">
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-64 h-full admin-sidebar">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-gray-400"
                        >
                            <X size={20} />
                        </button>
                        <NavContent />
                    </div>
                </div>
            )}
        </>
    );
}

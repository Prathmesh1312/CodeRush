import AdminSidebar from "@/components/admin/AdminSidebar";

// Force all admin pages to be dynamic (no static prerendering)
// Firebase client SDK requires browser env vars unavailable at build time
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <AdminSidebar />
            <main className="flex-1 lg:pl-0 pt-14 lg:pt-0 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
            </main>
        </div>
    );
}

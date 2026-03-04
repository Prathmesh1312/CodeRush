import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "CodeZest — IEEE Competitive Coding Event",
    description:
        "Live leaderboard for the IEEE CodeZest competitive coding event. Track student rankings, solving times, and winners in real time.",
    keywords: ["IEEE", "CodeZest", "competitive coding", "leaderboard", "event"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased min-h-screen" style={{ background: "var(--bg-primary)" }}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#1f2937",
                            color: "#f9fafb",
                            border: "1px solid #374151",
                            fontFamily: "Inter, sans-serif",
                        },
                        success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
                    }}
                />
            </body>
        </html>
    );
}

import { todayDate } from "@/lib/utils";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Live Leaderboard — CodeZest IEEE",
    description: "Real-time leaderboard for the IEEE CodeZest competitive coding event.",
};

interface LeaderboardPageProps {
    searchParams: Promise<{ date?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
    const params = await searchParams;
    const date = params.date || todayDate();
    return <LeaderboardTable initialDate={date} />;
}

import { redirect } from "next/navigation";
import { todayDate } from "@/lib/utils";

export default function Home() {
    redirect(`/leaderboard?date=${todayDate()}`);
}

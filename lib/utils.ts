import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function parseTimeToSeconds(timeStr: string): number {
    const trimmed = timeStr.trim();
    // Support: "1:30", "90", "1m30s", "1 30"
    if (trimmed.includes(":")) {
        const [min, sec] = trimmed.split(":").map(Number);
        return min * 60 + (sec || 0);
    }
    if (trimmed.toLowerCase().includes("m")) {
        const mMatch = trimmed.match(/(\d+)m/);
        const sMatch = trimmed.match(/(\d+)s/);
        const m = mMatch ? parseInt(mMatch[1]) : 0;
        const s = sMatch ? parseInt(sMatch[1]) : 0;
        return m * 60 + s;
    }
    return parseInt(trimmed) || 0;
}

export function todayDate(): string {
    return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    return format(new Date(year, month - 1, day), "dd MMM yyyy");
}

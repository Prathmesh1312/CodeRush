"use client";

import { useRouter } from "next/navigation";

interface DateFilterProps {
    value: string;
    onChange: (date: string) => void;
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        onChange(newDate);
        router.push(`/leaderboard?date=${newDate}`, { scroll: false });
    };

    return (
        <input
            type="date"
            value={value}
            onChange={handleChange}
            className="bg-dark-700 border border-dark-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            style={{ colorScheme: "dark" }}
        />
    );
}

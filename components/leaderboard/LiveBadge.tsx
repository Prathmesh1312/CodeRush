export default function LiveBadge() {
    return (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-800/40 rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">LIVE</span>
        </div>
    );
}

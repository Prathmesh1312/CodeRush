import WinnerPanel from "@/components/admin/WinnerPanel";

export default function WinnerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Winner Declaration</h1>
                <p className="text-gray-500 text-sm mt-1">Declare the winner manually or view auto-declared winners</p>
            </div>
            <WinnerPanel />
        </div>
    );
}

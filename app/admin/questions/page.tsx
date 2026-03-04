import QuestionsManager from "@/components/admin/QuestionsManager";

export default function QuestionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Questions</h1>
                <p className="text-gray-500 text-sm mt-1">Manage coding questions shown on the board</p>
            </div>
            <QuestionsManager />
        </div>
    );
}

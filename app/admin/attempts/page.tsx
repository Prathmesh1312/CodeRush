import AttemptsTable from "@/components/admin/AttemptsTable";
import RecordAttemptForm from "@/components/admin/RecordAttemptForm";

export default function AttemptsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Attempts</h1>
                <p className="text-gray-500 text-sm mt-1">Record and manage student solving times</p>
            </div>
            <RecordAttemptForm />
            <AttemptsTable />
        </div>
    );
}

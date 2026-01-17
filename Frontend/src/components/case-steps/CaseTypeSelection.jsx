import { useState } from "react";
import { selectCaseType } from "../../api/case.api";

const TYPES = [
    "Talaq",
    "Khula",
    "Faskh-e-Nikah",
    "Talaq-e-Zaujiyat",
    "Wifa Sat",
    "Zawal Nama"
];

export default function CaseTypeSelection({ caseData, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState("");

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            await selectCaseType(caseData._id, selected);
            onUpdated();
        } catch (err) {
            alert("Failed to confirm type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-inner">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-islamicGreen tracking-tight">
                    Select Case Type
                </h2>
                <div className="w-16 h-1 bg-islamicGreen mx-auto mt-4 rounded-full opacity-20"></div>
                <p className="text-gray-500 mt-6 max-w-lg mx-auto leading-relaxed font-medium">
                    Your application has been approved. Please select the specific legal action you wish to pursue exactly as practiced in the Dar-ul-Qaza court.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelected(type)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 group ${selected === type
                            ? "bg-emerald-50 border-islamicGreen shadow-md"
                            : "bg-white border-gray-100 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/30"
                            }`}
                    >
                        <span className={`text-lg font-bold tracking-tight ${selected === type ? 'text-islamicGreen' : 'text-gray-700'}`}>{type}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity`}>
                            Judicial Proceeding
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 flex justify-center border-t border-emerald-50 pt-10">
                <button
                    onClick={handleConfirm}
                    disabled={!selected || loading}
                    className="w-full sm:w-auto bg-islamicGreen text-white px-16 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {loading ? "Confirming..." : "Confirm & Proceed / تصدیق کریں"}
                </button>
            </div>
        </div>
    );
}

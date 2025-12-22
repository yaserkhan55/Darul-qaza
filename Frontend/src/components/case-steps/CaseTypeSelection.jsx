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
        <div className="bg-slate-50 border-2 border-slate-300 p-8 shadow-inner font-serif">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-slate-800 pb-2 inline-block">
                    Select Case Type / قسم کا انتخاب
                </h2>
                <p className="text-slate-600 mt-4 max-w-lg mx-auto leading-relaxed">
                    Your application has been approved. Please select the specific legal action you wish to pursue exactly as practiced in the Dar-ul-Qaza court.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TYPES.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelected(type)}
                        className={`p-6 border-2 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 group ${selected === type
                                ? "bg-slate-800 border-slate-900 text-white shadow-lg"
                                : "bg-white border-slate-200 text-slate-800 hover:border-slate-800 hover:shadow-md"
                            }`}
                    >
                        <span className="text-lg font-bold tracking-wide">{type}</span>
                        <span className="text-sm border-t border-current pt-1 opacity-70 group-hover:opacity-100 transition-opacity italic">
                            Legal Proceeding
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-12 flex justify-center border-t-2 border-slate-200 pt-8">
                <button
                    onClick={handleConfirm}
                    disabled={!selected || loading}
                    className="bg-emerald-800 text-white px-12 py-3 font-bold uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-md active:transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {loading ? "Confirming..." : "Confirm & Proceed / تصدیق کریں"}
                </button>
            </div>
        </div>
    );
}

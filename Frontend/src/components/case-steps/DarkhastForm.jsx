import { useState } from "react";
import { submitDarkhast } from "../../api/case.api";

export default function DarkhastForm({ onSubmitted, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        applicantName: "",
        fatherHusbandName: "",
        cnic: "",
        address: "Lahore", // Default city
        respondentName: "",
        respondentAddress: "",
        nikahDate: "",
        nikahPlace: "",
        natureOfDispute: "",
        reliefRequested: "",
        statement: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await submitDarkhast(formData);
            onSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit Darkhast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-2 border-slate-300 p-8 shadow-inner font-serif">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                <h2 className="text-3xl font-bold uppercase tracking-widest text-slate-900">
                    Dar-ul-Qaza
                </h2>
                <p className="text-lg font-semibold text-slate-700 mt-1">
                    Darkhast (Application Form)
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 border-l-4 border-red-500 mb-6 font-sans">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase">
                            Applicant Name / نامِ سائل
                        </label>
                        <input
                            type="text"
                            name="applicantName"
                            value={formData.applicantName}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase">
                            Father/Husband Name / ولدیت/زوجیت
                        </label>
                        <input
                            type="text"
                            name="fatherHusbandName"
                            value={formData.fatherHusbandName}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase">
                            CNIC / شناختی کارڈ نمبر
                        </label>
                        <input
                            type="text"
                            name="cnic"
                            placeholder="00000-0000000-0"
                            value={formData.cnic}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase">
                            Address (Lahore-specific) / پتہ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Respondent Name / نامِ مسئول علیہ
                        </label>
                        <input
                            type="text"
                            name="respondentName"
                            value={formData.respondentName}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Respondent Address / پتہ مسئول علیہ
                        </label>
                        <input
                            type="text"
                            name="respondentAddress"
                            value={formData.respondentAddress}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Nikah Date / تاریخِ نکاح
                        </label>
                        <input
                            type="date"
                            name="nikahDate"
                            value={formData.nikahDate}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Nikah Place / مقامِ نکاح
                        </label>
                        <input
                            type="text"
                            name="nikahPlace"
                            value={formData.nikahPlace}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Nature of Dispute / نوعیتِ تنازعہ
                        </label>
                        <input
                            type="text"
                            name="natureOfDispute"
                            placeholder="e.g. Divorce, Maintenance, etc."
                            value={formData.natureOfDispute}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Relief Requested / استدعا
                        </label>
                        <input
                            type="text"
                            name="reliefRequested"
                            value={formData.reliefRequested}
                            onChange={handleChange}
                            required
                            className="w-full border-b-2 border-slate-400 focus:border-slate-800 outline-none py-1 bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-800 uppercase">
                            Detailed Statement / مفصل بیان
                        </label>
                        <textarea
                            name="statement"
                            rows="6"
                            value={formData.statement}
                            onChange={handleChange}
                            required
                            className="w-full border-2 border-slate-300 focus:border-slate-800 outline-none p-3 bg-slate-50 font-sans leading-relaxed"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t-2 border-slate-800">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-slate-600 font-bold uppercase tracking-wider hover:text-slate-900 transition font-sans"
                    >
                        Cancel / کینسل
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-800 text-white px-10 py-3 font-bold uppercase tracking-widest hover:bg-slate-950 transition-all shadow-md active:transform active:scale-95 disabled:opacity-50 font-sans"
                    >
                        {loading ? "Processing..." : "Submit Darkhast / جمع کریں"}
                    </button>
                </div>
            </form>
        </div>
    );
}

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
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-50 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-islamicGreen to-emerald-700 p-8 text-center">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dar-ul-Qaza</h2>
                <p className="text-emerald-100 font-bold text-xs uppercase tracking-[0.3em] mt-2">Darkhast (Application Form)</p>
            </div>

            <div className="p-8 sm:p-12">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-8 flex items-center gap-3">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Applicant Name / نامِ سائل"
                                name="applicantName"
                                value={formData.applicantName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Father/Husband Name / ولدیت/زوجیت"
                                name="fatherHusbandName"
                                value={formData.fatherHusbandName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="CNIC / شناختی کارڈ نمبر"
                                name="cnic"
                                value={formData.cnic}
                                onChange={handleChange}
                                placeholder="00000-0000000-0"
                                required
                            />
                            <InputField
                                label="Address (Lahore-specific) / پتہ"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Marriage & Respondent Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Respondent Name / نامِ مسئول علیہ"
                                name="respondentName"
                                value={formData.respondentName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Respondent Address / پتہ مسئول علیہ"
                                name="respondentAddress"
                                value={formData.respondentAddress}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Nikah Date / تاریخِ نکاح"
                                name="nikahDate"
                                type="date"
                                value={formData.nikahDate}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Nikah Place / مقامِ نکاح"
                                name="nikahPlace"
                                value={formData.nikahPlace}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Matter Details
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Nature of Dispute / نوعیتِ تنازعہ"
                                    name="natureOfDispute"
                                    value={formData.natureOfDispute}
                                    onChange={handleChange}
                                    placeholder="e.g. Divorce, Maintenance, etc."
                                    required
                                />
                                <InputField
                                    label="Relief Requested / استدعا"
                                    name="reliefRequested"
                                    value={formData.reliefRequested}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Detailed Statement / مفصل بیان</label>
                                <textarea
                                    name="statement"
                                    rows="6"
                                    value={formData.statement}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl p-5 text-gray-700 leading-relaxed focus:border-islamicGreen focus:bg-white outline-none transition-all"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-emerald-50">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto px-8 py-3 text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition"
                        >
                            Cancel / کینسل
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-islamicGreen text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Submit Application / جمع کریں"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl px-6 py-4 text-gray-900 font-medium focus:border-islamicGreen focus:bg-white outline-none transition-all placeholder:text-gray-300"
            />
        </div>
    );
}

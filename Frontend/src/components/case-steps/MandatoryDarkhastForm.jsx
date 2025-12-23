import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitDarkhast } from "../../api/case.api";

export default function MandatoryDarkhastForm({ onSubmitted, onCancel }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        // Date
        date: new Date().toISOString().split('T')[0],

        // First Party (Applicant)
        firstPartyName: "",
        firstPartyFatherName: "",
        firstPartyResidence: "",
        firstPartyDistrict: "",

        // Second Party (Respondent)
        secondPartyName: "",
        secondPartyFatherName: "",
        secondPartyResidence: "",
        secondPartyDistrict: ""
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
            // Validate required fields
            const requiredFields = [
                "firstPartyName", "firstPartyFatherName", "firstPartyResidence", "firstPartyDistrict",
                "secondPartyName", "secondPartyFatherName", "secondPartyResidence", "secondPartyDistrict"
            ];

            const missing = requiredFields.filter(field => !formData[field]?.toString().trim());
            if (missing.length > 0) {
                setError("Please fill all required fields");
                setLoading(false);
                return;
            }

            // Submit to backend
            await submitDarkhast({
                date: formData.date,
                firstPartyName: formData.firstPartyName,
                firstPartyFatherName: formData.firstPartyFatherName,
                firstPartyResidence: formData.firstPartyResidence,
                firstPartyDistrict: formData.firstPartyDistrict,
                secondPartyName: formData.secondPartyName,
                secondPartyFatherName: formData.secondPartyFatherName,
                secondPartyResidence: formData.secondPartyResidence,
                secondPartyDistrict: formData.secondPartyDistrict
            });

            onSubmitted();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit Darkhast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-2xl border-2 border-emerald-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 p-6 border-b-4 border-emerald-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white tracking-wide mb-1">دار القضاء</h2>
                    <p className="text-emerald-100 text-sm font-semibold">Darul Qaza All India Muslim Personal Law Board</p>
                    <p className="text-emerald-200 text-xs mt-1">Dist. Nanded, Maharashtra</p>
                </div>
            </div>

            {/* Mandatory Notice */}
            <div className="bg-amber-50 border-b-2 border-amber-200 p-4">
                <div className="max-w-4xl mx-auto">
                    <p className="text-amber-900 font-semibold text-sm text-center">
                        <span className="block text-sm font-bold uppercase tracking-wide mb-1">{t('form.sections.mandatoryNotice')}</span>
                        <span className="text-xs">{t('form.sections.mandatoryMessage')}</span>
                    </p>
                </div>
            </div>

            <div className="p-8 sm:p-12">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-8 flex items-center gap-3">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Date Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            {t('form.sections.darkhastDate')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={t('form.fields.date')}
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* First Party (Applicant) */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            {t('form.sections.firstParty')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={t('form.fields.firstPartyName')}
                                name="firstPartyName"
                                value={formData.firstPartyName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.firstPartyFatherName')}
                                name="firstPartyFatherName"
                                value={formData.firstPartyFatherName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.firstPartyResidence')}
                                name="firstPartyResidence"
                                value={formData.firstPartyResidence}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.firstPartyDistrict')}
                                name="firstPartyDistrict"
                                value={formData.firstPartyDistrict}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Second Party (Respondent) */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            {t('form.sections.secondParty')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={t('form.fields.secondPartyName')}
                                name="secondPartyName"
                                value={formData.secondPartyName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.secondPartyFatherName')}
                                name="secondPartyFatherName"
                                value={formData.secondPartyFatherName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.secondPartyResidence')}
                                name="secondPartyResidence"
                                value={formData.secondPartyResidence}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t('form.fields.secondPartyDistrict')}
                                name="secondPartyDistrict"
                                value={formData.secondPartyDistrict}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-emerald-50">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full sm:w-auto px-8 py-3 text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition"
                            >
                                {t('common.cancel')}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-islamicGreen text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : t('form.submitDarkhast')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required, disabled, readOnly, min }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                className={`w-full border-2 rounded-2xl px-6 py-4 font-medium focus:border-islamicGreen focus:bg-white outline-none transition-all placeholder:text-gray-300 ${disabled || readOnly
                    ? 'bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-50/30 border-emerald-50 text-gray-900'
                    }`}
            />
        </div>
    );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitDarkhast } from "../../api/case.api";

export default function DarkhastForm({ onSubmitted, onCancel, preselectedType }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        applicantName: "",
        fatherGuardianName: "",
        cnic: "",
        address: "",
        respondentName: "",
        respondentFatherName: "",
        respondentAddress: "",
        nikahDate: "",
        nikahPlace: "",
        natureOfDispute: preselectedType || "",
        reliefRequested: "",
        statement: "",
        faskhGrounds: "",
        evidenceUrl: "",
        // Specialized fields
        talaqDate: "",
        talaqCount: "",
        mahrStatus: "",
        khulaReason: "",
        mahrReturn: "",
        maintenanceAmount: "",
        residenceStatus: "",
        nikahRegNo: "",
        correctionRequired: ""
    });

    const isFaskh = preselectedType === "Faskh-e-Nikah" || formData.natureOfDispute === "Faskh-e-Nikah";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isFaskh && !formData.faskhGrounds) {
            setError(t("form.errors.required") + " (Faskh Grounds)");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await submitDarkhast({
                darkhast: { ...formData },
                type: preselectedType || formData.natureOfDispute,
                faskhDetails: isFaskh ? { grounds: formData.faskhGrounds, evidenceUrl: formData.evidenceUrl } : undefined
            });
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
                <div className="flex flex-col items-center gap-1 mt-2">
                    {preselectedType && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-1">
                            {preselectedType === "Talaq-e-Zaujiyat" ? "Talaq-e-Zaujiyat" : preselectedType.replace(/-/g, ' ')}
                        </span>
                    )}
                    <p className="text-emerald-100 font-bold text-xs uppercase tracking-[0.3em]">{t("form.submitDarkhast")}</p>
                </div>
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
                            {t("form.personalDetails")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={t("form.fields.applicantName")}
                                name="applicantName"
                                value={formData.applicantName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t("form.fields.fatherGuardianName")}
                                name="fatherGuardianName"
                                value={formData.fatherGuardianName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t("form.fields.cnic")}
                                name="cnic"
                                value={formData.cnic}
                                onChange={handleChange}
                                placeholder="00000-0000000-0"
                                required
                            />
                            <InputField
                                label={t("form.fields.address")}
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
                            {t("form.marriageDetails")}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label={t("form.fields.respondentName")}
                                name="respondentName"
                                value={formData.respondentName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t("form.fields.respondentFatherName")}
                                name="respondentFatherName"
                                value={formData.respondentFatherName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label={t("form.fields.respondentAddress")}
                                name="respondentAddress"
                                value={formData.respondentAddress}
                                onChange={handleChange}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField
                                    label={t("form.fields.nikahDate")}
                                    name="nikahDate"
                                    type="date"
                                    value={formData.nikahDate}
                                    onChange={handleChange}
                                    required
                                />
                                <InputField
                                    label={t("form.fields.nikahPlace")}
                                    name="nikahPlace"
                                    value={formData.nikahPlace}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Specialized Sections */}
                    <SpecializedSection
                        type={preselectedType || formData.natureOfDispute}
                        formData={formData}
                        handleChange={handleChange}
                        t={t}
                    />

                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            {t("form.natureOfDispute")}
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label={t("form.fields.natureOfDispute")}
                                    name="natureOfDispute"
                                    value={formData.natureOfDispute}
                                    onChange={handleChange}
                                    disabled={!!preselectedType}
                                    required
                                />
                                <InputField
                                    label={t("form.fields.reliefRequested")}
                                    name="reliefRequested"
                                    value={formData.reliefRequested}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t("form.fields.statement")}</label>
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
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-islamicGreen text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? t("common.loading") : t("form.submitDarkhast")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SpecializedSection({ type, formData, handleChange, t }) {
    if (type === "Talaq") {
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                    <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                    {t("form.sections.talaq")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label={t("form.fields.talaqDate")} name="talaqDate" type="date" value={formData.talaqDate} onChange={handleChange} required />
                    <InputField label={t("form.fields.talaqCount")} name="talaqCount" type="number" value={formData.talaqCount} onChange={handleChange} required />
                    <InputField label={t("form.fields.mahrStatus")} name="mahrStatus" value={formData.mahrStatus} onChange={handleChange} required />
                </div>
            </div>
        );
    }
    if (type === "Khula") {
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                    <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                    {t("form.sections.khula")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t("form.fields.khulaReason")} name="khulaReason" value={formData.khulaReason} onChange={handleChange} required />
                    <InputField label={t("form.fields.mahrReturn")} name="mahrReturn" value={formData.mahrReturn} onChange={handleChange} required />
                </div>
            </div>
        );
    }
    if (type === "Faskh-e-Nikah") {
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                    <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                    {t("form.sections.faskh")}
                </h3>
                <div className="p-6 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 space-y-4">
                    <label className="block text-[10px] font-black text-islamicGreen uppercase tracking-widest px-1">{t("form.faskh.grounds")}</label>
                    <select
                        name="faskhGrounds"
                        value={formData.faskhGrounds}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border-2 border-emerald-50 rounded-xl px-4 py-3 text-sm focus:border-islamicGreen outline-none transition-all"
                    >
                        <option value="">-- Select Ground --</option>
                        <option value="Husband missing">{t("form.faskh.husbandMissing")}</option>
                        <option value="No maintenance">{t("form.faskh.noMaintenance")}</option>
                        <option value="Cruelty">{t("form.faskh.cruelty")}</option>
                        <option value="Impotence">{t("form.faskh.impotence")}</option>
                        <option value="Long absence">{t("form.faskh.longAbsence")}</option>
                        <option value="Other valid Shariah reason">{t("form.faskh.other")}</option>
                    </select>
                    <p className="text-[10px] text-emerald-600 italic">{t("form.errors.evidence")}</p>
                </div>
            </div>
        );
    }
    if (type === "Virasat") {
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                    <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                    {t("form.sections.virasat")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t("form.fields.maintenanceAmount")} name="maintenanceAmount" value={formData.maintenanceAmount} onChange={handleChange} required />
                    <InputField label={t("form.fields.residenceStatus")} name="residenceStatus" value={formData.residenceStatus} onChange={handleChange} required />
                </div>
            </div>
        );
    }
    if (type === "Zauj Nama Dispute") {
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                    <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                    {t("form.sections.zaujnama")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t("form.fields.nikahRegNo")} name="nikahRegNo" value={formData.nikahRegNo} onChange={handleChange} required />
                    <InputField label={t("form.fields.correctionRequired")} name="correctionRequired" value={formData.correctionRequired} onChange={handleChange} required />
                </div>
            </div>
        );
    }
    return null;
}

function InputField({ label, name, value, onChange, placeholder, type = "text", required, disabled }) {
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
                disabled={disabled}
                className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl px-6 py-4 text-gray-900 font-medium focus:border-islamicGreen focus:bg-white outline-none transition-all placeholder:text-gray-300 disabled:opacity-50"
            />
        </div>
    );
}

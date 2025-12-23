import { useState } from "react";
import { useTranslation } from "react-i18next";
import { submitDarkhast } from "../../api/case.api";

export default function MandatoryDarkhastForm({ onSubmitted, onCancel }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        // Court info
        courtName: "Dar-ul-Qaza, Nanded, Maharashtra",
        district: "",
        state: "",

        // Applicant (First Party)
        applicantName: "",
        fatherGuardianName: "",
        applicantGender: "",
        applicantAge: "",
        address: "",
        applicantMobile: "",
        cnic: "",

        // Respondent (Second Party)
        respondentName: "",
        respondentFatherName: "",
        respondentAddress: "",

        // Case Details
        nikahDate: "",
        nikahPlace: "",
        natureOfDispute: "",

        // Darkhast Statement
        statement: ""
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
                "district", "state", "applicantName", "fatherGuardianName",
                "applicantGender", "applicantAge", "address", "applicantMobile",
                "respondentName", "respondentFatherName", "respondentAddress",
                "nikahDate", "nikahPlace", "natureOfDispute", "statement"
            ];

            const missing = requiredFields.filter(field => !formData[field]?.toString().trim());
            if (missing.length > 0) {
                setError("Please fill all required fields");
                setLoading(false);
                return;
            }

            // Submit to backend
            await submitDarkhast({
                applicantName: formData.applicantName,
                fatherGuardianName: formData.fatherGuardianName,
                applicantGender: formData.applicantGender,
                applicantAge: parseInt(formData.applicantAge),
                applicantMobile: formData.applicantMobile,
                address: formData.address,
                district: formData.district,
                state: formData.state,
                cnic: formData.cnic,
                respondentName: formData.respondentName,
                respondentFatherName: formData.respondentFatherName,
                respondentAddress: formData.respondentAddress,
                nikahDate: formData.nikahDate,
                nikahPlace: formData.nikahPlace,
                natureOfDispute: formData.natureOfDispute,
                statement: formData.statement
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
            {/* Header */}
            <div className="bg-gradient-to-r from-islamicGreen to-emerald-700 p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">⚖️</div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dar-ul-Qaza</h2>
                <p className="text-emerald-100 font-bold text-xs uppercase tracking-[0.3em] mt-2">Darkhast (Request Application)</p>
            </div>

            {/* Mandatory Notice */}
            <div className="bg-amber-50 border-b-2 border-amber-200 p-4">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <span className="text-2xl">📋</span>
                    <p className="text-amber-900 font-bold text-sm">
                        Darkhast (Request Application) is mandatory. Please complete this form first to proceed further.
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
                    {/* Court Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Court Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField
                                label="Court Name"
                                name="courtName"
                                value={formData.courtName}
                                onChange={handleChange}
                                disabled
                                readOnly
                            />
                            <InputField
                                label="District / City"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Nanded"
                            />
                            <InputField
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Maharashtra"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Application Number
                                </label>
                                <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-500 font-medium italic">
                                    Auto-generated on submit
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    File Number
                                </label>
                                <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-500 font-medium italic">
                                    Assigned after approval
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Date of Submission
                                </label>
                                <div className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-500 font-medium italic">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Applicant (First Party) */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Applicant (First Party)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Name"
                                name="applicantName"
                                value={formData.applicantName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Father / Guardian Name"
                                name="fatherGuardianName"
                                value={formData.fatherGuardianName}
                                onChange={handleChange}
                                required
                            />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="applicantGender"
                                    value={formData.applicantGender}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl px-6 py-4 text-gray-900 font-medium focus:border-islamicGreen focus:bg-white outline-none transition-all"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <InputField
                                label="Age"
                                name="applicantAge"
                                type="number"
                                value={formData.applicantAge}
                                onChange={handleChange}
                                required
                                min="18"
                            />
                            <InputField
                                label="Full Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Mobile Number"
                                name="applicantMobile"
                                type="tel"
                                value={formData.applicantMobile}
                                onChange={handleChange}
                                required
                                placeholder="10-digit mobile number"
                            />
                            <InputField
                                label="CNIC / Aadhar (Optional)"
                                name="cnic"
                                value={formData.cnic}
                                onChange={handleChange}
                                placeholder="00000-0000000-0"
                            />
                        </div>
                    </div>

                    {/* Respondent (Second Party) */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Respondent (Second Party)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Name"
                                name="respondentName"
                                value={formData.respondentName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Father Name"
                                name="respondentFatherName"
                                value={formData.respondentFatherName}
                                onChange={handleChange}
                                required
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Full Address"
                                    name="respondentAddress"
                                    value={formData.respondentAddress}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Case Details */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Case Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField
                                label="Nikah Date"
                                name="nikahDate"
                                type="date"
                                value={formData.nikahDate}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Nikah Place"
                                name="nikahPlace"
                                value={formData.nikahPlace}
                                onChange={handleChange}
                                required
                            />
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    Matter Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="natureOfDispute"
                                    value={formData.natureOfDispute}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl px-6 py-4 text-gray-900 font-medium focus:border-islamicGreen focus:bg-white outline-none transition-all"
                                >
                                    <option value="">Select Matter Type</option>
                                    <option value="Talaq">Talaq</option>
                                    <option value="Khula">Khula</option>
                                    <option value="Faskh-e-Nikah">Faskh-e-Nikah</option>
                                    <option value="Talaq-e-Zaujiyat">Talaq-e-Zaujiyat</option>
                                    <option value="Virasat">Virasat</option>
                                    <option value="Zauj Nama Dispute">Zauj Nama Dispute</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Darkhast Statement */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            Darkhast Statement
                        </h3>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                Plain Text Complaint <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="statement"
                                rows="8"
                                value={formData.statement}
                                onChange={handleChange}
                                required
                                placeholder="Write your detailed complaint here in plain text..."
                                className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl p-5 text-gray-700 leading-relaxed focus:border-islamicGreen focus:bg-white outline-none transition-all"
                            ></textarea>
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
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-islamicGreen text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Darkhast"}
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

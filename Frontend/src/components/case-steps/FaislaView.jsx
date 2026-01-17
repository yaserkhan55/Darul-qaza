import { useTranslation } from "react-i18next";

export default function FaislaView({ caseData }) {
    const { t } = useTranslation();
    const { faisla, type } = caseData;

    if (!faisla) return (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-50 shadow-inner">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">📜</div>
            <h3 className="text-xl font-bold text-islamicGreen tracking-tight">{t("faisla.awaiting")}</h3>
            <p className="text-gray-500 mt-2 font-medium">{t("faisla.awaitingText")}</p>
        </div>
    );

    const handleDownloadCertificate = () => {
        window.open(`${import.meta.env.VITE_API_BASE_URL}/cases/${caseData._id}/certificate/pdf`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* THE OFFICIAL FAISLA (ORDER SHEET) */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl relative border border-emerald-50 overflow-hidden">
                <div className="bg-emerald-50/30 -mx-12 -mt-12 p-12 text-center border-b border-emerald-100 mb-12">
                    <h1 className="text-4xl font-black text-islamicGreen tracking-tight uppercase">{t("faisla.title")}</h1>
                    <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.4em]">{t("faisla.subtitle")}</p>
                </div>

                <div className="space-y-12 relative z-10">
                    <div className="grid grid-cols-2 gap-8 border-b border-emerald-50 pb-8">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-300 block mb-1">{t("faisla.caseNumber")}</span>
                                <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter italic">{caseData.displayId || caseData.caseId}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-300 block mb-1">{t("faisla.matter")}</span>
                                <span className="text-xl font-bold text-islamicGreen">{faisla.decisionType || type}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-300 block mb-1">{t("faisla.date")}</span>
                                <span className="text-2xl font-black text-gray-900">{new Date(faisla.issuedAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-300 block mb-1">{t("faisla.registry")}</span>
                                <span className="text-xl font-bold text-gray-900 uppercase tabular-nums">{faisla.courtSealRef}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-islamicGreen flex items-center gap-3">
                            <span className="w-2 h-6 bg-islamicGreen rounded-full"></span>
                            {t("faisla.judgment")}
                        </h3>
                        <div className="bg-emerald-50/20 rounded-2xl p-8 border border-emerald-50 min-h-[300px]">
                            <p className="text-xl leading-[1.8] text-gray-800 whitespace-pre-wrap font-medium indent-12 italic">
                                "{faisla.finalOrderText}"
                            </p>
                        </div>
                    </div>

                    <div className="pt-12 flex flex-col items-center">
                        <div className="text-center">
                            <div className="w-64 border-t-2 border-emerald-50 pt-4 mb-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">{t("faisla.qaziSignature")}</p>
                                <p className="text-2xl font-black text-islamicGreen italic tracking-tight">{faisla.qaziSignature || 'Qazi (Dar-ul-Qaza)'}</p>
                            </div>
                            <div className="inline-block p-4 border border-islamicGreen/20 rounded-full opacity-30 transform scale-110">
                                <span className="text-[10px] font-black text-islamicGreen uppercase tracking-widest">{t("faisla.seal")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DOWNLOAD SECTION */}
            <div className="bg-islamicGreen rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="space-y-2 text-center md:text-left relative z-10">
                    <h4 className="text-3xl font-black tracking-tight">{t("faisla.downloadTitle")}</h4>
                    <p className="text-emerald-100 text-sm max-w-md italic font-medium">
                        {t("faisla.downloadText")}
                    </p>
                </div>
                <button
                    onClick={handleDownloadCertificate}
                    className="w-full md:w-auto bg-white text-islamicGreen px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95 relative z-10"
                >
                    {t("faisla.downloadButton")}
                </button>
            </div>
        </div>
    );
}

import { useTranslation } from "react-i18next";

export default function ArbitrationStep({ caseData }) {
    const { t } = useTranslation();
    const { arbitration } = caseData;

    if (!arbitration) return (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-50 shadow-inner">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🤝</div>
            <h3 className="text-xl font-bold text-islamicGreen tracking-tight">{t("arbitration.waiting")}</h3>
            <p className="text-gray-500 mt-2 font-medium">{t("arbitration.waitingText")}</p>
        </div>
    );

    const isSuccess = arbitration.result === "SUCCESS";

    return (
        <div className="max-w-3xl mx-auto">
            <div className={`p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden bg-white border ${isSuccess ? 'border-emerald-100 shadow-emerald-100' : 'border-emerald-50 shadow-gray-100'}`}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-islamicGreen tracking-tight">
                        {t("arbitration.title")}
                    </h2>
                    <div className="w-12 h-1 bg-islamicGreen mx-auto mt-4 rounded-full opacity-20"></div>
                    <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.3em]">
                        {t("arbitration.subtitle")}
                    </p>
                </div>

                <div className="space-y-10 relative z-10">
                    <div className="flex flex-col items-center">
                        <div className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-lg shadow-lg ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-500 text-white shadow-rose-200'} transition-transform hover:scale-105`}>
                            {isSuccess ? t("arbitration.reconciled") : t("arbitration.failed")}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest text-center px-4">
                            {t("arbitration.status")}
                        </p>
                    </div>

                    <div className="bg-emerald-50/30 rounded-2xl p-8 border border-emerald-50">
                        <span className="text-[10px] font-black text-islamicGreen uppercase block mb-4 tracking-widest text-center">{t("arbitration.notes")}</span>
                        <p className="text-lg leading-relaxed text-gray-700 italic text-center font-medium whitespace-pre-wrap">
                            "{arbitration.notes}"
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-300 border-t border-emerald-50 pt-8">
                        <div className="flex items-center gap-2">
                            <span>{t("notice.issued")}:</span>
                            <span className="text-gray-900">{new Date(arbitration.date || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="text-islamicGreen opacity-40">{t("notice.authenticated")}</div>
                    </div>
                </div>

                {/* Success/Fail Detailed Notice */}
                <div className="mt-10">
                    {isSuccess ? (
                        <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl border border-emerald-100 text-sm font-medium leading-relaxed animate-fade-in text-center">
                            {t("arbitration.success")}
                        </div>
                    ) : (
                        <div className="bg-gray-50 text-gray-500 p-5 rounded-2xl border border-gray-100 text-sm font-medium leading-relaxed italic animate-fade-in text-center">
                            {t("arbitration.failed")} - {t("arbitration.subtitle")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

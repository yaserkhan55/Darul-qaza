import { useTranslation } from "react-i18next";

export default function NoticeView({ caseData }) {
    const { t } = useTranslation();
    const { notice, type } = caseData;

    if (!notice) return (
        <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-100">
            <p className="text-amber-800 font-bold">{t("notice.awaiting")}</p>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-50 max-w-4xl mx-auto relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-islamicGreen tracking-tight">{t("notice.title")}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t("notice.courtName")}</p>
                </div>
                <div className="text-left md:text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Case ID</span>
                    <span className="text-xl font-bold text-gray-900 font-mono italic">{caseData.displayId || caseData.caseId}</span>
                </div>
            </div>

            <div className="space-y-10 relative z-10">
                <div className="bg-emerald-50/50 rounded-2xl p-6 border-l-4 border-islamicGreen">
                    <p className="text-gray-700 leading-relaxed font-medium italic">
                        {t("notice.body", { type })}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 border border-emerald-50 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-islamicGreen">
                            <span className="text-2xl">📅</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">{t("notice.schedule")}</h3>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Date</span>
                                <span className="text-xl font-bold text-gray-900">{new Date(notice.hearingDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Time</span>
                                <span className="text-xl font-bold text-gray-900">{new Date(notice.hearingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-emerald-50 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-islamicGreen">
                            <span className="text-2xl">📍</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">{t("notice.venue")}</h3>
                        </div>
                        <div className="pt-2">
                            <p className="text-lg text-gray-900 font-bold leading-snug">
                                {t("notice.venueDetails")}
                            </p>
                        </div>
                    </div>
                </div>

                {notice.notes && (
                    <div className="pt-8 border-t border-emerald-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">{t("notice.instructions")}</span>
                        <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100 text-gray-700 text-sm italic leading-relaxed">
                            {notice.notes}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-emerald-50 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <span>{t("notice.issued")}: {new Date(notice.issuedAt).toLocaleString()}</span>
                <span className="text-islamicGreen opacity-40">{t("notice.authenticated")}</span>
            </div>
        </div>
    );
}

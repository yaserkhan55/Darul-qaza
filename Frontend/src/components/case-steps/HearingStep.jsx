import { useTranslation } from "react-i18next";

export default function HearingStep({ caseData }) {
    const { t } = useTranslation();
    const { attendance = [], hearingStatements = [] } = caseData;

    const combinedHearings = hearingStatements.map((h, i) => ({
        ...h,
        attendance: attendance[i] || {}
    }));

    const hearingDetails = caseData.hearing;
    const isHearingScheduled = hearingDetails && hearingDetails.hearingDate;

    if (combinedHearings.length === 0 && !isHearingScheduled) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-emerald-50 shadow-inner">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">📂</div>
                <h3 className="text-xl font-bold text-islamicGreen tracking-tight">{t("hearing.inProgress")}</h3>
                <p className="text-gray-500 mt-2 font-medium">{t("hearing.waitingRecords")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-emerald-50 pb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">⚖️</div>
                <div>
                    <h2 className="text-2xl font-black text-islamicGreen tracking-tight">{t("hearing.title")}</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t("hearing.subtitle")}</p>
                </div>
            </div>

            {/* Upcoming Hearing Card */}
            {isHearingScheduled && (
                <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-3xl p-8 shadow-lg shadow-indigo-100/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                            📅
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight">
                                Upcoming Hearing Details
                            </h3>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                Please be present on time
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
                                Date & Time
                            </label>
                            <div className="text-lg font-bold text-indigo-900">
                                {new Date(hearingDetails.hearingDate).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div className="text-2xl font-black text-indigo-600">
                                {hearingDetails.hearingTime}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
                                Mode & Location
                            </label>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${hearingDetails.hearingMode === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {hearingDetails.hearingMode === 'ONLINE' ? 'Online Meeting' : 'In-Person'}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                {hearingDetails.locationOrLink || "To be shared"}
                            </div>
                        </div>

                        {hearingDetails.hearingNotes && (
                            <div className="md:col-span-2 bg-white border border-indigo-50 rounded-xl p-4">
                                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">
                                    Instructions from Qazi
                                </label>
                                <p className="text-sm text-gray-600 italic">
                                    "{hearingDetails.hearingNotes}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Past Hearings List */}
            {combinedHearings.length > 0 && (
                <div className="space-y-12">
                    {combinedHearings.map((hearing, idx) => (
                        <div key={idx} className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden animate-fade-in">
                            <div className="bg-emerald-50/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-islamicGreen text-white rounded-lg flex items-center justify-center font-black text-sm">{idx + 1}</span>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("hearing.session")}</span>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">{t("hearing.sessionDate")}</span>
                                    <span className="font-bold text-gray-900">{new Date(hearing.date || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Attendance Section */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-islamicGreen uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-islamicGreen rounded-full"></span>
                                        {t("hearing.attendance")}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <PresenceBadge label={t("form.applicant.name")} present={hearing.attendance.applicantPresent} />
                                        <PresenceBadge label={t("form.respondent.name")} present={hearing.attendance.respondentPresent} />
                                    </div>
                                    {hearing.attendance.qaziRemarks && (
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-50">
                                            <span className="text-[10px] font-black text-emerald-800 uppercase block mb-1">{t("hearing.qaziNotes")}</span>
                                            <p className="text-xs italic text-emerald-900 font-medium">{hearing.attendance.qaziRemarks}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Statements Section */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-islamicGreen uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-islamicGreen rounded-full"></span>
                                        {t("hearing.statements")}
                                    </h4>
                                    <div className="space-y-6">
                                        <StatementBox title={t("hearing.applicantStatement")} content={hearing.applicantStatement} />
                                        <StatementBox title={t("hearing.respondentStatement")} content={hearing.respondentStatement} />
                                    </div>
                                </div>
                            </div>

                            {hearing.qaziNotes && (
                                <div className="bg-islamicGreen p-8">
                                    <span className="text-[10px] font-black text-emerald-100 uppercase block mb-3 tracking-widest opacity-60">{t("hearing.qaziNotes")}</span>
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
                                        "{hearing.qaziNotes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PresenceBadge({ label, present }) {
    const { t } = useTranslation();
    return (
        <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${present ? 'bg-emerald-50 border-islamicGreen text-islamicGreen' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 truncate w-full text-center">{label}</span>
            <span className="text-[10px] font-black">{present ? `✓ ${t("hearing.present")}` : `✗ ${t("hearing.absent")}`}</span>
        </div>
    );
}

function StatementBox({ title, content }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{title}</span>
            <div className="bg-white border-2 border-emerald-50 rounded-2xl p-4 text-sm text-gray-700 min-h-[100px] leading-relaxed italic shadow-inner">
                {content || t("hearing.noStatement")}
            </div>
        </div>
    );
}

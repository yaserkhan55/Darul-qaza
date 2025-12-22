export default function HearingStep({ caseData }) {
    const { attendance = [], hearingStatements = [] } = caseData;

    const combinedHearings = hearingStatements.map((h, i) => ({
        ...h,
        attendance: attendance[i] || {}
    }));

    if (combinedHearings.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border border-emerald-50 shadow-inner">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">📂</div>
                <h3 className="text-xl font-bold text-islamicGreen tracking-tight">Hearing in Progress</h3>
                <p className="text-gray-500 mt-2 font-medium">Waiting for official records to be uploaded by the court clerk.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-emerald-50 pb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">⚖️</div>
                <div>
                    <h2 className="text-2xl font-black text-islamicGreen tracking-tight">Official Hearing Records</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Dar-ul-Qaza Court Certified Digital Record</p>
                </div>
            </div>

            <div className="space-y-12">
                {combinedHearings.map((hearing, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-emerald-50 shadow-sm overflow-hidden animate-fade-in">
                        <div className="bg-emerald-50/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-islamicGreen text-white rounded-lg flex items-center justify-center font-black text-sm">{idx + 1}</span>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Hearing Session</span>
                            </div>
                            <div className="text-left sm:text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">Session Date</span>
                                <span className="font-bold text-gray-900">{new Date(hearing.date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Attendance Section */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-islamicGreen uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-islamicGreen rounded-full"></span>
                                    Attendance Form (Hazri)
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <PresenceBadge label="Applicant" present={hearing.attendance.applicantPresent} />
                                    <PresenceBadge label="Respondent" present={hearing.attendance.respondentPresent} />
                                </div>
                                {hearing.attendance.qaziRemarks && (
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-50">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase block mb-1">Qazi's Remarks</span>
                                        <p className="text-xs italic text-emerald-900 font-medium">{hearing.attendance.qaziRemarks}</p>
                                    </div>
                                )}
                            </div>

                            {/* Statements Section */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-islamicGreen uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-islamicGreen rounded-full"></span>
                                    Hearing Statements
                                </h4>
                                <div className="space-y-6">
                                    <StatementBox title="Applicant's Statement" content={hearing.applicantStatement} />
                                    <StatementBox title="Respondent's Statement" content={hearing.respondentStatement} />
                                </div>
                            </div>
                        </div>

                        {hearing.qaziNotes && (
                            <div className="bg-islamicGreen p-8">
                                <span className="text-[10px] font-black text-emerald-100 uppercase block mb-3 tracking-widest opacity-60">Judicial Notes (Qazi)</span>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
                                    "{hearing.qaziNotes}"
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function PresenceBadge({ label, present }) {
    return (
        <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${present ? 'bg-emerald-50 border-islamicGreen text-islamicGreen' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
            <span className="text-sm font-black">{present ? '✓ PRESENT' : '✗ ABSENT'}</span>
        </div>
    );
}

function StatementBox({ title, content }) {
    return (
        <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{title}</span>
            <div className="bg-white border-2 border-emerald-50 rounded-2xl p-4 text-sm text-gray-700 min-h-[100px] leading-relaxed italic shadow-inner">
                {content || "No statement recorded."}
            </div>
        </div>
    );
}

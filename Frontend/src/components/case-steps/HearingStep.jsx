export default function HearingStep({ caseData }) {
    const { attendance = [], hearingStatements = [] } = caseData;

    const combinedHearings = hearingStatements.map((h, i) => ({
        ...h,
        attendance: attendance[i] || {}
    }));

    if (combinedHearings.length === 0) {
        return (
            <div className="bg-slate-50 border-2 border-slate-300 p-12 text-center rounded-lg shadow-inner">
                <div className="text-5xl mb-4 opacity-50">📂</div>
                <h3 className="text-xl font-bold text-slate-900 uppercase font-serif">Hearing in Progress</h3>
                <p className="text-slate-600 font-serif mt-2 italic">Waiting for official records to be uploaded by the court clerk.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-serif">
            <div className="bg-slate-900 text-white p-4 rounded-t-lg flex justify-between items-center shadow-lg">
                <h2 className="text-xl font-bold uppercase tracking-widest">Official Hearing Records (Hazri)</h2>
                <span className="bg-emerald-600 text-[10px] px-2 py-1 rounded font-black tracking-tighter uppercase">Court Certified</span>
            </div>

            <div className="space-y-12">
                {combinedHearings.map((hearing, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-200 shadow-xl overflow-hidden rounded-lg">
                        <div className="bg-slate-50 border-b-2 border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-black text-slate-400 uppercase">Hearing No.</span>
                                <span className="text-2xl font-black text-slate-900 italic">{idx + 1}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-400 uppercase block">Hearing Date</span>
                                <span className="text-lg font-bold text-slate-900">{new Date(hearing.date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/30">
                            {/* Attendance Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Attendance Status</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <PresenceBadge label="Applicant" present={hearing.attendance.applicantPresent} />
                                    <PresenceBadge label="Respondent" present={hearing.attendance.respondentPresent} />
                                </div>
                                {hearing.attendance.qaziRemarks && (
                                    <div className="mt-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Qazi's Remarks on Presence</span>
                                        <p className="text-sm italic text-slate-700 bg-white p-3 border border-slate-200 rounded">{hearing.attendance.qaziRemarks}</p>
                                    </div>
                                )}
                            </div>

                            {/* Statements Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">Hearing Statements</h4>
                                <div className="space-y-6">
                                    <StatementBox title="Applicant's Statement" content={hearing.applicantStatement} />
                                    <StatementBox title="Respondent's Statement" content={hearing.respondentStatement} />
                                </div>
                            </div>
                        </div>

                        {hearing.qaziNotes && (
                            <div className="bg-slate-900 p-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-[.2em]">Qazi's Judicial Notes</span>
                                <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
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
        <div className={`p-3 border-2 rounded flex flex-col items-center gap-1 ${present ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
            <span className="text-lg font-bold">{present ? '✓ PRESENT' : '✗ ABSENT'}</span>
        </div>
    );
}

function StatementBox({ title, content }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{title}</span>
            <div className="bg-white p-4 border border-slate-200 rounded text-sm text-slate-800 min-h-[80px] leading-relaxed italic shadow-inner">
                {content || "No statement recorded."}
            </div>
        </div>
    );
}

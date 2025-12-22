export default function NoticeView({ caseData }) {
    const { notice, type } = caseData;

    if (!notice) return (
        <div className="bg-amber-50 border-2 border-amber-200 p-8 text-center rounded-lg">
            <p className="text-amber-800 font-bold font-serif">Awaiting Notice from Qazi / نوٹس کا انتظار</p>
        </div>
    );

    return (
        <div className="bg-white border-4 border-slate-900 p-10 shadow-2xl font-serif max-w-4xl mx-auto relative overflow-hidden">
            {/* Court Seal watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-150">
                <svg width="400" height="400" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                    <text x="50" y="55" fontSize="10" textAnchor="middle" fontWeight="bold">DAR-UL-QAZA</text>
                </svg>
            </div>

            <div className="text-center mb-10 border-b-4 border-slate-900 pb-6">
                <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-slate-900">
                    Court Notice
                </h2>
                <p className="text-xl font-bold text-slate-800 mt-2">
                    Dar-ul-Qaza Muslim Personal Law Court
                </p>
            </div>

            <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                        <span className="text-xs uppercase font-black text-slate-400 block mb-1">Case Number</span>
                        <span className="text-xl font-bold text-slate-900 font-mono italic">#{caseData.caseId?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs uppercase font-black text-slate-400 block mb-1">Date of Issue</span>
                        <span className="text-xl font-bold text-slate-900">{new Date(notice.issuedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 border-l-8 border-slate-900">
                    <p className="text-lg leading-relaxed text-slate-800 italic">
                        "By order of the Qazi, a notice is hereby issued in the case of <b>{type}</b>.
                        The parties are directed to appear before this court for the scheduled hearing as stated below."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <h3 className="text-sm uppercase font-black text-slate-500 border-b-2 border-slate-100 pb-2">Hearing Details</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase block">Scheduled Date</span>
                                <span className="text-2xl font-black text-emerald-800">{new Date(notice.hearingDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase block">Scheduled Time</span>
                                <span className="text-xl font-bold text-slate-900">{new Date(notice.hearingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm uppercase font-black text-slate-500 border-b-2 border-slate-100 pb-2">Location</h3>
                        <p className="text-lg text-slate-900 font-bold leading-snug">
                            Dar-ul-Qaza Main Court Room<br />
                            <span className="text-sm font-medium text-slate-600 uppercase">Judicial Complex, Lahore</span>
                        </p>
                    </div>
                </div>

                {notice.notes && (
                    <div className="pt-6 border-t border-slate-200">
                        <span className="text-xs uppercase font-black text-slate-400 block mb-2">Instructions from Qazi</span>
                        <div className="bg-amber-50 p-4 border border-amber-200 text-amber-900 text-sm whitespace-pre-wrap leading-relaxed">
                            {notice.notes}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-16 flex flex-col items-end">
                <div className="w-64 text-center border-t border-slate-900 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Authenticated By</p>
                    <p className="text-xl font-bold text-slate-900 italic">Official Qazi Seal</p>
                    <div className="mt-4 flex justify-center opacity-20 transform -rotate-12">
                        <div className="border-4 border-slate-900 rounded-full p-2">
                            <span className="text-xs font-black">CERTIFIED COURT RECORD</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

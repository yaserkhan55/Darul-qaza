export default function NoticeView({ caseData }) {
    const { notice, type } = caseData;

    if (!notice) return (
        <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-100">
            <p className="text-amber-800 font-bold">Awaiting Notice from Qazi / نوٹس کا انتظار</p>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-emerald-50 max-w-4xl mx-auto relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-islamicGreen tracking-tight">Court Notice</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Dar-ul-Qaza Muslim Personal Law Court</p>
                </div>
                <div className="text-left md:text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Case ID</span>
                    <span className="text-xl font-bold text-gray-900 font-mono italic">#{caseData.caseId?.slice(-8).toUpperCase()}</span>
                </div>
            </div>

            <div className="space-y-10 relative z-10">
                <div className="bg-emerald-50/50 rounded-2xl p-6 border-l-4 border-islamicGreen">
                    <p className="text-gray-700 leading-relaxed font-medium italic">
                        By order of the Qazi, a notice is hereby issued in the case of <span className="text-islamicGreen font-bold">{type}</span>.
                        The parties are directed to appear before this court for the scheduled hearing as stated below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 border border-emerald-50 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 text-islamicGreen">
                            <span className="text-2xl">📅</span>
                            <h3 className="text-xs font-black uppercase tracking-widest">Hearing Schedule</h3>
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
                            <h3 className="text-xs font-black uppercase tracking-widest">Venue</h3>
                        </div>
                        <div className="pt-2">
                            <p className="text-lg text-gray-900 font-bold leading-snug">
                                Dar-ul-Qaza Lahore<br />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Court Room • Ground Floor</span>
                            </p>
                        </div>
                    </div>
                </div>

                {notice.notes && (
                    <div className="pt-8 border-t border-emerald-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Qazi's Instructions</span>
                        <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100 text-gray-700 text-sm italic leading-relaxed">
                            {notice.notes}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-emerald-50 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <span>Issued: {new Date(notice.issuedAt).toLocaleString()}</span>
                <span className="text-islamicGreen opacity-40">Digital Court Authenticated</span>
            </div>
        </div>
    );
}

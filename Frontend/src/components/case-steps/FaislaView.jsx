export default function FaislaView({ caseData }) {
    const { faisla, type, caseId } = caseData;

    if (!faisla) return (
        <div className="bg-slate-50 border-2 border-slate-300 p-12 text-center rounded-lg shadow-inner">
            <div className="text-5xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-slate-900 uppercase font-serif">Awaiting Final Decision</h3>
            <p className="text-slate-600 font-serif mt-2 italic">The Qazi is preparing the final Order Sheet (Faisla). Please wait.</p>
        </div>
    );

    const handleDownloadCertificate = () => {
        window.open(`${import.meta.env.VITE_API_BASE_URL}/cases/${caseData._id}/certificate/pdf`, '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 font-serif pb-20">
            {/* THE OFFICIAL FAISLA (ORDER SHEET) */}
            <div className="bg-white border-[10px] border-slate-900 p-12 shadow-2xl relative">
                {/* Court Identification */}
                <div className="text-center mb-12 border-b-4 border-slate-950 pb-8">
                    <h1 className="text-5xl font-black uppercase tracking-[0.3em] text-slate-900">Order Sheet</h1>
                    <h2 className="text-2xl font-bold text-slate-700 mt-2">Dar-ul-Qaza Muslim Personal Law Court</h2>
                    <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-widest italic">Judicial Record of Final Decision</p>
                </div>

                <div className="space-y-12 relative z-10">
                    <div className="grid grid-cols-2 gap-8 border-b-2 border-slate-100 pb-8">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Case Number</span>
                                <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">#{caseId?.slice(-8).toUpperCase()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Action Type</span>
                                <span className="text-xl font-bold text-slate-800">{type}</span>
                            </div>
                        </div>
                        <div className="text-right space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Date of Decision</span>
                                <span className="text-2xl font-black text-slate-900">{new Date(faisla.decisionDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Decision Reference</span>
                                <span className="text-xl font-bold text-slate-800 uppercase tabular-nums">{faisla.courtSealRef || 'DQ/KHI/2024-OX'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-l-4 border-slate-900 pl-4">Final Judgment / فیصلہ</h3>
                        <div className="bg-slate-50 p-8 border-2 border-slate-100 min-h-[300px] shadow-inner">
                            <p className="text-xl leading-[1.8] text-slate-900 whitespace-pre-wrap font-medium indent-12 italic">
                                "{faisla.finalOrderText}"
                            </p>
                        </div>
                    </div>

                    <div className="pt-20 flex flex-col items-center">
                        <div className="text-center space-y-2">
                            <div className="w-64 border-t-2 border-slate-950 pt-4">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Official Signature</p>
                                <p className="text-2xl font-black text-slate-900 italic tracking-tight">{faisla.qaziSignature || 'Qazi (Dar-ul-Qaza)'}</p>
                            </div>
                            <div className="mt-8">
                                <div className="inline-block p-4 border-8 border-double border-slate-950 rounded-full opacity-60 transform scale-110">
                                    <div className="text-center font-black leading-none uppercase text-[8px] space-y-1">
                                        <div className="border-b border-slate-950 pb-1">Verified By Court</div>
                                        <div className="text-[12px] py-1">DAR-UL-QAZA</div>
                                        <div className="border-t border-slate-950 pt-1">Official Seal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-4 left-4 border-t-2 border-l-2 border-slate-900 w-8 h-8"></div>
                <div className="absolute top-4 right-4 border-t-2 border-r-2 border-slate-900 w-8 h-8"></div>
                <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-slate-900 w-8 h-8"></div>
                <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-slate-900 w-8 h-8"></div>
            </div>

            {/* DOWNLOAD SECTION */}
            <div className="flex flex-col items-center space-y-6">
                <div className="p-8 bg-emerald-900 text-white rounded-2xl shadow-2xl w-full flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white/20">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-2xl font-black uppercase tracking-wide">Certificate Ready</h4>
                        <p className="text-emerald-100 text-sm max-w-md italic opacity-80">
                            The final judgment has been formalized. You may now download your official Dar-ul-Qaza certificate. This document is a legal judicial record.
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadCertificate}
                        className="bg-white text-emerald-900 px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-50 transition-all transform hover:-translate-y-1 active:translate-y-0"
                    >
                        Download Certificate (PDF)
                    </button>
                </div>

                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] text-center">
                    Digitally generated by Dar-ul-Qaza System • Secure & Immutable record
                </p>
            </div>
        </div>
    );
}

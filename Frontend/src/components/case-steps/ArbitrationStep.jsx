export default function ArbitrationStep({ caseData }) {
    const { arbitration } = caseData;

    if (!arbitration) return (
        <div className="bg-slate-50 border-2 border-slate-300 p-12 text-center rounded-lg shadow-inner">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-900 uppercase font-serif">Arbitration in Progress</h3>
            <p className="text-slate-600 font-serif mt-2 italic">The mandatory Sulh (reconciliation) attempt is being record. Please wait for the Qazi's report.</p>
        </div>
    );

    const isSuccess = arbitration.result === "SUCCESS";

    return (
        <div className="max-w-3xl mx-auto font-serif">
            <div className={`p-8 border-4 rounded-xl shadow-2xl relative overflow-hidden bg-white ${isSuccess ? 'border-emerald-900' : 'border-slate-900'}`}>
                <div className="text-center mb-10 border-b-2 border-slate-200 pb-6">
                    <h2 className="text-3xl font-black uppercase tracking-widest text-slate-900">
                        Arbitration Record (Sulh)
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                        Mandatory Reconciliation Attempt under Shariah Law
                    </p>
                </div>

                <div className="space-y-10">
                    <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>Date of Attempt:</span>
                            <span className="text-slate-900">{new Date(arbitration.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span className={isSuccess ? 'text-emerald-700' : 'text-slate-900'}>OFFICIAL RECORD</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className={`text-4xl px-8 py-3 font-black border-4 rounded-full uppercase tracking-[0.2em] transform -rotate-1 shadow-lg ${isSuccess ? 'bg-emerald-100 border-emerald-900 text-emerald-900' : 'bg-slate-100 border-slate-900 text-slate-900'}`}>
                            {isSuccess ? 'SUCCESSFUL' : 'FAILED'}
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-tighter">
                            Final Verdict of Reconciliation Session
                        </p>
                    </div>

                    <div className="bg-slate-50 p-6 border border-slate-200 rounded-lg shadow-inner">
                        <span className="text-xs font-black text-slate-400 uppercase block mb-3 tracking-widest">Mediator / Qazi Notes</span>
                        <p className="text-lg leading-relaxed text-slate-800 italic text-center font-medium">
                            "{arbitration.notes}"
                        </p>
                    </div>

                    <div className="pt-8 flex flex-col items-center space-y-4 text-center">
                        {isSuccess ? (
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded border border-emerald-200 text-sm leading-relaxed">
                                <p className="font-bold mb-1 uppercase tracking-tight">Case Conclusion Notice</p>
                                As decomposition was successful through arbitration, this case is now marked as resolved. No divorce certificate will be issued.
                            </div>
                        ) : (
                            <div className="bg-slate-50 text-slate-700 p-4 rounded border border-slate-200 text-sm leading-relaxed italic">
                                Since reconciliation failed despite exhaustive attempts, the court will now proceed to the final decision (Faisla) according to Islamic principles.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-center opacity-30">
                    <div className="border-4 border-slate-900 rounded-full h-24 w-24 flex items-center justify-center font-black text-[10px] text-center p-2 uppercase rotate-12">
                        Official Sulh Record
                    </div>
                </div>
            </div>
        </div>
    );
}

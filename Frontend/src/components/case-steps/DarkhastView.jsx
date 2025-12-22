export default function DarkhastView({ caseData }) {
    const { darkhast } = caseData;

    if (!darkhast) return <div>No darkhast data</div>;

    return (
        <div className="bg-white border-2 border-slate-300 p-8 shadow-inner font-serif">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                <h2 className="text-3xl font-bold uppercase tracking-widest text-slate-900 leading-tight">
                    Dar-ul-Qaza
                </h2>
                <p className="text-lg font-semibold text-slate-700 mt-1">
                    Darkhast (Submitted Application)
                </p>
                <div className="mt-4 inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-bold border border-amber-200">
                    Status: Pending before Qazi
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailItem label="Applicant Name" value={darkhast.applicantName} />
                <DetailItem label="Father/Husband Name" value={darkhast.fatherHusbandName} />
                <DetailItem label="CNIC" value={darkhast.cnic} />
                <DetailItem label="Address" value={darkhast.address} />
                <DetailItem label="Respondent Name" value={darkhast.respondentName} />
                <DetailItem label="Respondent Address" value={darkhast.respondentAddress} />
                <DetailItem label="Nikah Date" value={darkhast.nikahDate ? new Date(darkhast.nikahDate).toLocaleDateString() : ""} />
                <DetailItem label="Nikah Place" value={darkhast.nikahPlace} />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
                <DetailItem label="Nature of Dispute" value={darkhast.natureOfDispute} fullWidth />
                <div className="mt-4">
                    <DetailItem label="Relief Requested" value={darkhast.reliefRequested} fullWidth />
                </div>
                <div className="mt-6 space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Detailed Statement
                    </label>
                    <div className="bg-slate-50 p-4 border-2 border-slate-200 min-h-[150px] text-slate-800 whitespace-pre-wrap leading-relaxed italic">
                        {darkhast.statement}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <div className="border-t border-slate-400 w-48 text-center pt-2">
                    <p className="text-xs uppercase font-bold text-slate-500 tracking-tighter">
                        Digital Signature Verification
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                        {darkhast.applicantName}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, fullWidth = false }) {
    return (
        <div className={`space-y-1 ${fullWidth ? "col-span-full" : ""}`}>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest italic">
                {label}
            </span>
            <span className="text-lg text-slate-900 border-b border-slate-200 block pb-1 min-h-[1.75rem]">
                {value || "---"}
            </span>
        </div>
    );
}

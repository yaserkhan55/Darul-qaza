import { useEffect, useState } from "react";
import { downloadCertificate } from "../api/admin.api";

export default function CertificateView({ caseData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // In a real app, this would call the API. For now we use the same structure.
      const blob = await downloadCertificate(caseData._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `darulqaza-certificate-${caseData.caseId || caseData._id.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const isReady = ["DECISION_APPROVED", "CASE_CLOSED"].includes(caseData.status);

  if (!caseData || !isReady) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 font-serif italic">Certificate not issued yet / سرٹیفکیٹ ابھی جاری نہیں ہوا</p>
      </div>
    );
  }

  const { darkhast, type, faisla } = caseData;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto font-serif border-4 border-slate-900">
      <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 uppercase tracking-widest">
          Dar-ul-Qaza
        </h2>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Official Judicial Certificate</p>
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold border-b-2 border-slate-900 inline-block pb-1 mb-6">CERTIFICATE OF {type?.toUpperCase()}</h3>

          <div className="space-y-6 text-left max-w-md mx-auto">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">Case Number</span>
              <span className="font-bold text-slate-900 font-mono tracking-tighter italic">#{caseData.caseId?.slice(-8).toUpperCase()}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">Type of Dissolution</span>
              <span className="font-bold text-slate-900">{type}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">Applicant Name</span>
              <span className="font-bold text-slate-900">{darkhast?.applicantName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">Respondent Name</span>
              <span className="font-bold text-slate-900">{darkhast?.respondentName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">Effective Date</span>
              <span className="font-bold text-slate-900">{faisla?.decisionDate ? new Date(faisla.decisionDate).toLocaleDateString() : "---"}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-600 italic bg-slate-50 p-4 border border-slate-100 rounded">
          <p>"This document serves as final proof of the dissolution of marriage according to the principles of Islamic Shariah and the procedures of Dar-ul-Qaza."</p>
        </div>

        <div className="pt-10 flex flex-col items-center">
          <div className="w-48 border-t-2 border-slate-900 pt-2 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400">Authenticated By</p>
            <p className="font-bold text-slate-900 italic">Signature of Qazi</p>
          </div>

          <div className="mt-8 opacity-40">
            <div className="border-4 border-slate-900 rounded-full h-16 w-16 flex items-center justify-center font-black text-[8px] text-center p-1 uppercase rotate-12">
              Official Court Seal
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center no-print">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-slate-900 text-white px-8 py-3 rounded font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
        >
          {downloading ? "Generating PDF..." : "Download Original (PDF)"}
        </button>
      </div>
    </div>
  );
}



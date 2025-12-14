import { useEffect, useState } from "react";
import { downloadCertificate } from "../api/admin.api";

export default function CertificateView({ caseData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadCertificate(caseData._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `divorce-certificate-${caseData._id.slice(-8)}.pdf`;
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

  if (!caseData || caseData.status !== "APPROVED") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Certificate not available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📜</div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-islamicGreen mb-2">
          Divorce Certificate
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Official Islamic Divorce Certificate</p>
      </div>

      <div className="border-2 border-islamicGreen rounded-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-serif mb-2">
            <span className="text-xl sm:text-2xl lg:text-3xl">دار القضاء</span>
            <br />
            <span className="text-islamicGreen text-base sm:text-lg lg:text-xl">Dar-ul-Qaza</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">Islamic Family Resolution Platform</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 sm:py-6 my-4 sm:my-6">
          <p className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4">CERTIFICATE OF DIVORCE</p>
          
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm lg:text-base">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
              <span className="text-gray-600">Case ID:</span>
              <span className="font-mono font-semibold break-all sm:break-normal">{caseData._id}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
              <span className="text-gray-600">Divorce Type:</span>
              <span className="font-semibold">{caseData.divorceType}</span>
            </div>

            {caseData.divorceForm && (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                  <span className="text-gray-600">Husband Name:</span>
                  <span className="font-semibold break-words">{caseData.divorceForm.husbandName}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                  <span className="text-gray-600">Wife Name:</span>
                  <span className="font-semibold break-words">{caseData.divorceForm.wifeName}</span>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
              <span className="text-gray-600">Date of Approval:</span>
              <span className="font-semibold">{new Date(caseData.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>This certificate is issued in accordance with Islamic Shariah law</p>
          <p>and confirms the legal dissolution of marriage.</p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">Verified and Approved by Qazi</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-islamicGreen text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
        >
          {downloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Downloading...
            </span>
          ) : (
            "Download PDF Certificate"
          )}
        </button>
      </div>
    </div>
  );
}


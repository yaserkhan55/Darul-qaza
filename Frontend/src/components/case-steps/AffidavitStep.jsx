import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { saveAffidavits } from "../../api/case.api";

const initialUploads = {
  applicant: { url: "", progress: 0, filename: "", uploadedAt: null },
  respondent: { url: "", progress: 0, filename: "", uploadedAt: null },
  witnesses: [], // Array for multiple witness affidavits
  nikahnama: { url: "", progress: 0, filename: "", uploadedAt: null },
  idProof: { url: "", progress: 0, filename: "", uploadedAt: null },
};

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function AffidavitStep({ caseData, caseId, onUpdated }) {
  const [uploads, setUploads] = useState(initialUploads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveCaseId = caseData?._id || caseId;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

  const { t } = useTranslation();

  // Load existing affidavits if available
  useEffect(() => {
    if (caseData?.affidavits) {
      const affs = caseData.affidavits;
      setUploads({
        applicant: affs.applicantAffidavit || initialUploads.applicant,
        respondent: affs.respondentAffidavit || initialUploads.respondent,
        witnesses: affs.witnessAffidavits || [],
        nikahnama: affs.nikahnama || initialUploads.nikahnama,
        idProof: affs.idProof || initialUploads.idProof,
      });
    }
  }, [caseData]);

  // Validate required affidavits based on case type
  const allComplete = useMemo(() => {
    const caseType = caseData?.type;

    if (caseType === "Talaq") {
      // Talaq: Husband affidavit + at least 1 witness required
      const hasApplicant = uploads.applicant?.url;
      const hasWitnesses = uploads.witnesses && uploads.witnesses.length >= 1 &&
        uploads.witnesses.every((w) => w.url);
      return hasApplicant && hasWitnesses;
    } else if (caseType === "Khula") {
      // Khula: Wife affidavit + at least 1 witness required
      const hasApplicant = uploads.applicant?.url;
      const hasWitnesses = uploads.witnesses && uploads.witnesses.length >= 1 &&
        uploads.witnesses.every((w) => w.url);
      return hasApplicant && hasWitnesses;
    }

    // Fallback: require all
    const required = [
      uploads.applicant?.url,
      uploads.respondent?.url,
      uploads.nikahnama?.url,
      uploads.idProof?.url,
    ];
    const witnessesComplete = uploads.witnesses && uploads.witnesses.length >= 1 &&
      uploads.witnesses.every((w) => w.url);
    return required.every(Boolean) && witnessesComplete;
  }, [uploads, caseData?.type]);

  const handleFile = async (key, file, witnessIndex = null) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setError(t("form.errors.fileType"));
      return;
    }
    if (!cloudName || !unsignedPreset) {
      setError("Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET.");
      return;
    }
    setError("");
    try {
      const uploadedAt = new Date().toISOString();
      const url = await uploadToCloudinary({
        file,
        cloudName,
        uploadPreset: unsignedPreset,
        onProgress: (progress) => {
          if (key === "witnesses" && witnessIndex !== null) {
            setUploads((prev) => {
              const newWitnesses = [...(prev.witnesses || [])];
              newWitnesses[witnessIndex] = { ...newWitnesses[witnessIndex], progress };
              return { ...prev, witnesses: newWitnesses };
            });
          } else {
            setUploads((prev) => ({
              ...prev,
              [key]: { ...prev[key], progress },
            }));
          }
        },
      });

      if (key === "witnesses" && witnessIndex !== null) {
        setUploads((prev) => {
          const newWitnesses = [...(prev.witnesses || [])];
          newWitnesses[witnessIndex] = { url, progress: 100, filename: file.name, uploadedAt };
          return { ...prev, witnesses: newWitnesses };
        });
      } else {
        setUploads((prev) => ({
          ...prev,
          [key]: { url, progress: 100, filename: file.name, uploadedAt },
        }));
      }
    } catch (err) {
      setError(t("form.errors.uploadFailed"));
      if (key === "witnesses" && witnessIndex !== null) {
        setUploads((prev) => {
          const newWitnesses = [...(prev.witnesses || [])];
          newWitnesses[witnessIndex] = { ...newWitnesses[witnessIndex], progress: 0 };
          return { ...prev, witnesses: newWitnesses };
        });
      } else {
        setUploads((prev) => ({
          ...prev,
          [key]: { ...prev[key], progress: 0 },
        }));
      }
    }
  };

  const addWitnessSlot = () => {
    setUploads((prev) => ({
      ...prev,
      witnesses: [...(prev.witnesses || []), { url: "", progress: 0 }],
    }));
  };

  const removeWitnessSlot = (index) => {
    setUploads((prev) => {
      const newWitnesses = [...(prev.witnesses || [])];
      newWitnesses.splice(index, 1);
      return { ...prev, witnesses: newWitnesses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const caseType = caseData?.type;

    // Validate based on case type
    if (caseType === "Talaq") {
      if (!uploads.applicant?.url) {
        setError("Husband affidavit is required for Talaq cases.");
        return;
      }
      if (!uploads.witnesses || uploads.witnesses.length < 1 || !uploads.witnesses[0]?.url) {
        setError("At least one witness affidavit is required for Talaq cases.");
        return;
      }
    } else if (caseType === "Khula") {
      if (!uploads.applicant?.url) {
        setError("Wife affidavit is required for Khula cases.");
        return;
      }
      if (!uploads.witnesses || uploads.witnesses.length < 1 || !uploads.witnesses[0]?.url) {
        setError("At least one witness affidavit is required for Khula cases.");
        return;
      }
    } else if (!allComplete) {
      setError("Please upload all required documents.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // Persist full metadata so it can be displayed in dashboard/admin
      await saveAffidavits(effectiveCaseId, {
        applicantAffidavit: uploads.applicant,
        respondentAffidavit: uploads.respondent,
        witnessAffidavits: uploads.witnesses,
        nikahnama: uploads.nikahnama,
        idProof: uploads.idProof,
      });
      // Backend will transition to UNDER_REVIEW automatically
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save affidavits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const caseType = caseData?.type;
  const isReadOnly = caseData?.status === "UNDER_REVIEW" || caseData?.status === "APPROVED";

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Affidavits (Mandatory Before Qazi Review)</h2>
        <p className="text-sm text-gray-600 mb-4">
          {isReadOnly
            ? "View your uploaded affidavits below."
            : "You must upload the required affidavits before your case can proceed to Qazi review."}
        </p>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-sm text-amber-900 mb-4">
          <strong className="block mb-2">Required Documents (Bayan-e-Halafi & Statements):</strong>
          {caseType === "Talaq" ? (
            <ul className="list-disc list-inside space-y-1">
              <li>{t("documents.labels.applicant")} (Mandatory)</li>
              <li>At least 1 {t("documents.labels.witness")} (Mandatory)</li>
              <li>{t("documents.labels.nikahnama")} (Recommended)</li>
              <li>{t("documents.labels.idProof")} (Recommended)</li>
            </ul>
          ) : caseType === "Khula" ? (
            <ul className="list-disc list-inside space-y-1">
              <li>{t("documents.labels.applicant")} (Mandatory)</li>
              <li>At least 1 {t("documents.labels.witness")} (Mandatory)</li>
              <li>{t("documents.labels.nikahnama")} (Recommended)</li>
              <li>{t("documents.labels.idProof")} (Recommended)</li>
            </ul>
          ) : (
            <p>Please upload all required Shariah-compliant documents.</p>
          )}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>{t("documents.title")}:</strong> {t("documents.secureNote")}
        </div>
      </div>

      {caseData?.decisionComment?.comment && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Message from Registry / Qazi</h3>
          <p className="text-sm text-blue-800 leading-relaxed">{caseData.decisionComment.comment}</p>
          <p className="text-xs text-blue-600 mt-2 italic">
            All records are reviewed by qualified Islamic authorities at Darul Qaza.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: "applicant",
                label: t("documents.labels.applicant"),
                required: true
              },
              { key: "respondent", label: t("documents.labels.respondent"), required: false },
              { key: "nikahnama", label: t("documents.labels.nikahnama"), required: false },
              { key: "idProof", label: t("documents.labels.idProof"), required: false },
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.label} {item.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFile(item.key, e.target.files?.[0])}
                  disabled={isReadOnly}
                  className={`block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-islamicGreen file:text-white hover:file:bg-teal-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <Progress status={uploads[item.key]} />
              </div>
            ))}
          </div>

          {/* Witness Affidavits - Multiple */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                {t("documents.labels.witness")} <span className="text-red-500">*</span> ({t("form.errors.witnesses")})
              </label>
              <button
                type="button"
                onClick={addWitnessSlot}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              >
                + {t("documents.buttons.addWitness")}
              </button>
            </div>
            <div className="space-y-3">
              {(uploads.witnesses || []).map((witness, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFile("witnesses", e.target.files?.[0], index)}
                      disabled={isReadOnly}
                      className={`block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-islamicGreen file:text-white hover:file:bg-teal-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <Progress status={witness} />
                  </div>
                  {(uploads.witnesses || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWitnessSlot(index)}
                      className="text-red-600 hover:text-red-800 text-sm px-2"
                    >
                      {t("common.delete", { defaultValue: "Remove" })}
                    </button>
                  )}
                </div>
              ))}
              {(!uploads.witnesses || uploads.witnesses.length === 0) && (
                <button
                  type="button"
                  onClick={addWitnessSlot}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600 hover:border-islamicGreen hover:text-islamicGreen"
                >
                  + {t("documents.buttons.addWitness")}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {!isReadOnly && (
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={loading || !allComplete}
              className="bg-islamicGreen text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t("common.loading") : "Submit Affidavits"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Progress({ status }) {
  if (!status) return null;
  const { progress, url } = status;
  return (
    <div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-islamicGreen transition-all"
          style={{ width: `${progress || 0}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {url ? "Uploaded" : progress ? `${progress}%` : "Waiting for file"}
      </div>
    </div>
  );
}

function uploadToCloudinary({ file, cloudName, uploadPreset, onProgress }) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error("Upload failed"));
        }
      }
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "darul-qaza/cases");

    xhr.send(formData);
  });
}


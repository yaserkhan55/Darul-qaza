import { useMemo, useState } from "react";
import { saveAffidavits, transitionCase } from "@/api/case.api";

const initialUploads = {
  applicant: { url: "", progress: 0 },
  respondent: { url: "", progress: 0 },
  witnesses: [], // Array for multiple witness affidavits
  nikahnama: { url: "", progress: 0 },
  idProof: { url: "", progress: 0 },
};

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

export default function AffidavitStep({ caseId, onUpdated }) {
  const [uploads, setUploads] = useState(initialUploads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

  const allComplete = useMemo(() => {
    const required = [
      uploads.applicant?.url,
      uploads.respondent?.url,
      uploads.nikahnama?.url,
      uploads.idProof?.url,
    ];
    const witnessesComplete = uploads.witnesses && uploads.witnesses.length >= 1 && 
      uploads.witnesses.every((w) => w.url);
    return required.every(Boolean) && witnessesComplete;
  }, [uploads]);

  const handleFile = async (key, file, witnessIndex = null) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    if (!cloudName || !unsignedPreset) {
      setError("Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET.");
      return;
    }
    setError("");
    try {
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
          newWitnesses[witnessIndex] = { url, progress: 100, filename: file.name };
          return { ...prev, witnesses: newWitnesses };
        });
      } else {
        setUploads((prev) => ({
          ...prev,
          [key]: { url, progress: 100, filename: file.name },
        }));
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
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
    if (!allComplete) {
      setError("Please upload all required documents.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await saveAffidavits(caseId, {
        applicantAffidavit: uploads.applicant.url,
        respondentAffidavit: uploads.respondent.url,
        witnessAffidavits: uploads.witnesses.map((w) => w.url),
        nikahnama: uploads.nikahnama.url,
        idProof: uploads.idProof.url,
      });
      // Transition to UNDER_REVIEW after affidavits are done
      await transitionCase(caseId, { nextStatus: "UNDER_REVIEW" });
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save affidavits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Affidavits & Documents</h2>
        <p className="text-sm text-gray-600 mb-3">Upload the required affidavits and supporting documents.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>Secure Upload:</strong> Documents are securely uploaded and stored via Cloudinary cloud storage. 
          Your files are encrypted and accessible only to authorized Qazi reviewers.
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "applicant", label: "Applicant Affidavit", required: true },
              { key: "respondent", label: "Respondent Affidavit", required: true },
              { key: "nikahnama", label: "Nikahnama (Marriage Certificate)", required: true },
              { key: "idProof", label: "ID Proof", required: true },
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.label} {item.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFile(item.key, e.target.files?.[0])}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-islamicGreen file:text-white hover:file:bg-teal-700"
                />
                <Progress status={uploads[item.key]} />
              </div>
            ))}
          </div>

          {/* Witness Affidavits - Multiple */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Witness Affidavits <span className="text-red-500">*</span> (Minimum 1, recommended 2)
              </label>
              <button
                type="button"
                onClick={addWitnessSlot}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              >
                + Add Witness
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
                      className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-islamicGreen file:text-white hover:file:bg-teal-700"
                    />
                    <Progress status={witness} />
                  </div>
                  {(uploads.witnesses || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWitnessSlot(index)}
                      className="text-red-600 hover:text-red-800 text-sm px-2"
                    >
                      Remove
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
                  + Add First Witness Affidavit
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-islamicGreen text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-60 transition"
          >
            {loading ? "Saving..." : "Submit Affidavits"}
          </button>
        </div>
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


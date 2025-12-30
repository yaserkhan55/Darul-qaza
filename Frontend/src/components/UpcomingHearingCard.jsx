export default function UpcomingHearingCard({ caseData }) {
  const hearing = caseData?.hearing;
  const noticeHearingDate = caseData?.notice?.hearingDate;

  if (!hearing && !noticeHearingDate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <span className="text-lg">📖</span>
          Upcoming Hearing / Majlis
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          You will be notified when a hearing is scheduled. Please continue to check this page calmly; the Qazi will fix a suitable date and time insha’Allah.
        </p>
      </div>
    );
  }

  const date = hearing?.hearingDate || noticeHearingDate;
  const mode = hearing?.mode || "IN_PERSON";

  return (
    <div className="bg-emerald-50/80 rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-emerald-900 mb-1 flex items-center gap-2">
            <span className="text-lg">🕊️</span>
            Upcoming Hearing / Majlis
          </h3>
          <p className="text-[11px] text-emerald-800/80">
            This sitting is for calm, Shariah-guided discussion in front of the Qazi.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 bg-white/60 px-2 py-1 rounded-full">
          Notified
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white/80 rounded-xl border border-emerald-100 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 mb-1">
            Date
          </p>
          <p className="font-semibold text-emerald-900">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </p>
        </div>
        <div className="bg-white/80 rounded-xl border border-emerald-100 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 mb-1">
            Time
          </p>
          <p className="font-semibold text-emerald-900">
            {hearing?.hearingTime || "To be communicated"}
          </p>
        </div>
        <div className="bg-white/80 rounded-xl border border-emerald-100 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 mb-1">
            Mode
          </p>
          <p className="font-semibold text-emerald-900">
            {mode === "ONLINE" ? "Online (Video / Phone)" : "In-person at Dar-ul-Qaza"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {hearing?.locationOrLink && (
          <p className="text-xs text-emerald-900">
            <span className="font-semibold">Location / Link:</span>{" "}
            <span className="break-all">{hearing.locationOrLink}</span>
          </p>
        )}
        {(hearing?.notesByQazi || caseData?.notice?.notes) && (
          <p className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-semibold">Instructions from Qazi:</span>{" "}
            {hearing?.notesByQazi || caseData.notice.notes}
          </p>
        )}
      </div>

      <p className="mt-3 text-[10px] text-emerald-800/80 italic">
        Final decisions are issued by qualified Islamic authorities.
      </p>
    </div>
  );
}



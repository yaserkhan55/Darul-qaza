export default function SuccessMessage({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Case Submitted / کیس جمع ہو گیا
          </h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-[11px] sm:text-xs text-gray-500 mb-6 leading-relaxed">
            This platform facilitates case submission only. Final decisions are made by qualified
            Islamic authorities in accordance with Islamic law.
          </p>
          <button
            onClick={onClose}
            className="bg-islamicGreen text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}


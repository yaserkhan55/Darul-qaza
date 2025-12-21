export default function LoadingSpinner({ text }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-islamicGreen rounded-full border-t-transparent animate-spin"></div>
            </div>
            {text && <p className="text-gray-500 font-medium text-sm animate-pulse">{text}</p>}
        </div>
    );
}

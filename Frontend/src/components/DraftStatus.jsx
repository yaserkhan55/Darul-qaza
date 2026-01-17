import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function DraftStatus({ lastSaved, isSaving }) {
    const { t } = useTranslation();
    const [timeAgo, setTimeAgo] = useState("");

    useEffect(() => {
        if (!lastSaved) return;

        const interval = setInterval(() => {
            const seconds = Math.floor((new Date() - new Date(lastSaved)) / 1000);
            if (seconds < 60) setTimeAgo("Just now");
            else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
        }, 10000);

        return () => clearInterval(interval);
    }, [lastSaved]);

    if (isSaving) {
        return (
            <span className="text-xs text-islamicGreen animate-pulse font-medium">
                Saving...
            </span>
        );
    }

    if (!lastSaved) return null;

    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-islamicGreen font-bold">✓</span>
            <span>Saved {timeAgo && `• ${timeAgo}`}</span>
        </div>
    );
}

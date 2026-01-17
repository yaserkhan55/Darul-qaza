import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getMyMessages, markMessageRead } from "../api/message.api";

export default function NotificationBell() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = messages.filter((m) => !m.read).length;

  useEffect(() => {
    if (!user) return;
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMyMessages(user.id);
        setMessages(data || []);
      } catch (err) {
        // silent fail – notifications are helpful but not critical
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleOpen = () => {
    if (!user) return;
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (messageId) => {
    try {
      await markMessageRead(messageId);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, read: true } : m))
      );
    } catch (err) {
      console.error("Failed to mark message as read", err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">Notifications</p>
            {loading && (
              <span className="text-[11px] text-gray-400">Loading…</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {messages.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-gray-500">
                No notifications yet.
              </div>
            )}
            {messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => handleMarkRead(msg._id)}
                className={`w-full text-left px-4 py-3 text-xs border-b border-gray-100 hover:bg-gray-50 ${
                  !msg.read ? "bg-emerald-50/70" : "bg-white"
                }`}
              >
                <p className="font-semibold text-gray-800 mb-1 truncate">
                  {msg.title}
                </p>
                <p className="text-gray-600 line-clamp-2">{msg.body}</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



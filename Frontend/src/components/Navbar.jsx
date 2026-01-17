import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { getMyMessages } from "../api/message.api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "";
  }, [user]);

  const initials = useMemo(() => {
    if (!displayName) return "";
    const parts = displayName.split(" ").filter(Boolean);
    return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase();
  }, [displayName]);

  // Load unread count for dashboard badge
  useEffect(() => {
    const loadUnread = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }
      try {
        const msgs = await getMyMessages(user.id);
        const unread = (msgs || []).filter((m) => !m.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load unread count", err);
      }
    };
    loadUnread();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-xl ring-1 ring-gray-200 text-gray-800"
          : "bg-gradient-to-r from-islamicGreen via-emerald-700 to-emerald-800 text-white shadow-xl"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Single line, larger font */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-serif tracking-wide flex items-center gap-2 ${scrolled ? "text-islamicGreen" : "text-white"
                }`}
            >
              <span className="text-3xl sm:text-4xl lg:text-[38px] leading-none">{t("common.brandUrdu")}</span>
              <span
                className={`text-sm sm:text-base lg:text-lg font-semibold ${scrolled ? "text-islamicGreen" : "text-white opacity-90"
                  }`}
              >
                {t("common.brandEnglish")}
              </span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-5">
            <LanguageSwitcher />
            <NotificationBell />
            <SignedIn>
              <button
                onClick={() => navigate("/dashboard")}
                className={`relative px-4 lg:px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm border ${isActive("/dashboard")
                    ? scrolled
                      ? "bg-islamicGreen text-white border-islamicGreen shadow-md"
                      : "bg-white text-islamicGreen border-white shadow-md"
                    : scrolled
                      ? "bg-white/90 text-gray-800 border-gray-200 hover:shadow"
                      : "bg-white/15 text-white border-white/30 hover:bg-white/25"
                  }`}
              >
                <span>{t("common.dashboard")}</span>
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-600 text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${scrolled
                        ? "bg-white text-gray-800 border-gray-200 hover:shadow"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    aria-label="User profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-islamicGreen to-emerald-700 flex items-center justify-center text-white font-bold shadow-inner">
                      {initials || "U"}
                    </div>
                    <span className="hidden lg:inline-block max-w-[140px] truncate">
                      {displayName}
                    </span>
                    <svg
                      className={`w-4 h-4 ${profileOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/dashboard");
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        {t("common.dashboard")}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        {t("common.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => navigate("/sign-in")}
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${scrolled
                    ? "bg-islamicGreen text-white hover:bg-teal-700"
                    : "bg-white/10 hover:bg-white/20 text-white hover:shadow-md"
                  }`}
              >
                {t("common.signIn")}
              </button>
            </SignedOut>
          </nav>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={`p-2 rounded-lg transition-all duration-200 ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${mobileMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => setMobileMenuOpen(false)}
            role="presentation"
          />
          <div
            className={`absolute left-4 right-4 top-16 sm:top-20 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 transition-transform duration-300 transition-opacity ${mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
              }`}
          >
            <nav className="flex flex-col p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <LanguageSwitcher mode="light" />
              </div>
              <SignedIn>
                <button
                  onClick={() => handleNavClick("/dashboard")}
                  className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive("/dashboard") ? "bg-islamicGreen text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {t("common.dashboard")}
                </button>
                {user && (
                  <div className="px-4 py-3 text-gray-700 text-sm border border-gray-100 rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-500">
                      {user.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  {t("common.signOut")}
                </button>
              </SignedIn>
              <SignedOut>
                <button
                  onClick={() => handleNavClick("/sign-in")}
                  className="text-left px-4 py-3 rounded-lg font-medium bg-islamicGreen text-white hover:bg-teal-700 transition-all duration-200"
                >
                  {t("common.signIn")}
                </button>
              </SignedOut>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

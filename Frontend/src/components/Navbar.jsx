import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg text-gray-800"
          : "bg-gradient-to-r from-islamicGreen to-emerald-700 text-white shadow-lg"
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
              className={`text-xl sm:text-2xl lg:text-3xl font-serif tracking-wide flex items-center gap-2 ${
                scrolled ? "text-islamicGreen" : "text-white"
              }`}
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl">دار القضاء</span>
              <span
                className={`text-sm sm:text-base lg:text-lg ${
                  scrolled ? "text-islamicGreen" : "text-islamicGold"
                }`}
              >
                Darul Qaza
              </span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => navigate("/")}
              className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? scrolled
                    ? "bg-islamicGreen/20 text-islamicGreen shadow-md"
                    : "bg-white/20 text-white shadow-md"
                  : scrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white/90 hover:text-white"
              }`}
            >
              Home
            </button>
            <SignedIn>
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? scrolled
                      ? "bg-islamicGreen/20 text-islamicGreen shadow-md"
                      : "bg-white/20 text-white shadow-md"
                    : scrolled
                      ? "hover:bg-gray-100 text-gray-700"
                      : "hover:bg-white/10 text-white/90 hover:text-white"
                }`}
              >
                Dashboard
              </button>
              {user && (
                <span
                  className={`px-3 lg:px-4 py-2 text-sm ${
                    scrolled ? "text-gray-700" : "text-white/90"
                  }`}
                >
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              )}
              <button
                onClick={handleLogout}
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  scrolled
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-white/10 hover:bg-white/20 text-white hover:shadow-md"
                }`}
              >
                Sign Out
              </button>
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => navigate("/sign-in")}
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  scrolled
                    ? "bg-islamicGreen text-white hover:bg-teal-700"
                    : "bg-white/10 hover:bg-white/20 text-white hover:shadow-md"
                }`}
              >
                Sign In
              </button>
            </SignedOut>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
              scrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 top-16 sm:top-20 bg-white/98 backdrop-blur-lg z-40 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col p-6 space-y-4">
            <button
              onClick={() => handleNavClick("/")}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-islamicGreen text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Home
            </button>
            <SignedIn>
              <button
                onClick={() => handleNavClick("/dashboard")}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-islamicGreen text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              {user && (
                <div className="px-4 py-3 text-gray-700 text-sm">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                Sign Out
              </button>
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => handleNavClick("/sign-in")}
                className="text-left px-4 py-3 rounded-lg font-medium bg-islamicGreen text-white hover:bg-teal-700 transition-all duration-200"
              >
                Sign In
              </button>
            </SignedOut>
          </nav>
        </div>
      </div>
    </header>
  );
}

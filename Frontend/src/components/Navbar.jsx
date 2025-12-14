import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, isAuthenticated } from "../api/auth.api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // In dev mode, show nav on dashboard even without auth token
  const authenticated = isAuthenticated() || location.pathname === "/dashboard" || location.pathname === "/admin";

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <h1 className={`text-base sm:text-lg lg:text-xl font-serif tracking-wide ${
              scrolled ? "text-islamicGreen" : "text-white"
            }`}>
              <span className="text-lg sm:text-xl lg:text-2xl">دار القضاء</span>
              <br className="sm:hidden" />
              <span className={`ml-1 sm:ml-2 text-xs sm:text-sm lg:text-base ${scrolled ? "text-islamicGreen" : "text-islamicGold"}`}>
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
            {authenticated && (
              <>
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
                <button
                  onClick={handleLogout}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    scrolled
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-white/10 hover:bg-white/20 text-white hover:shadow-md"
                  }`}
                >
                  Logout
                </button>
              </>
            )}
            {!authenticated && (
              <button
                onClick={() => navigate("/login")}
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  scrolled
                    ? "bg-islamicGreen text-white hover:bg-teal-700"
                    : "bg-white/10 hover:bg-white/20 text-white hover:shadow-md"
                }`}
              >
                Login
              </button>
            )}
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 top-16 bg-white/98 backdrop-blur-lg z-40 transform transition-transform duration-300 ease-in-out ${
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
            {authenticated && (
              <>
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
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!authenticated && (
              <button
                onClick={() => handleNavClick("/login")}
                className="text-left px-4 py-3 rounded-lg font-medium bg-islamicGreen text-white hover:bg-teal-700 transition-all duration-200"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
  
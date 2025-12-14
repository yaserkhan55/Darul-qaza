import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-islamicGreen text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Dar-ul-Qaza</h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              A dignified, Shariah-compliant platform for resolving family matters 
              according to Islamic principles with fairness and transparency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <a href="#contact" className="text-teal-100 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-teal-100">
              <li>Email: support@darulqaza.org</li>
              <li>Phone: +92 XXX XXXXXXX</li>
              <li>Address: Islamic Court Complex</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-600 pt-6 text-center">
          <p className="text-sm text-teal-100">
            © {currentYear} Dar-ul-Qaza. All rights reserved.
          </p>
          <p className="text-xs text-teal-200 mt-2">
            Serving the Muslim community with dignity and respect
          </p>
        </div>
      </div>
    </footer>
  );
}


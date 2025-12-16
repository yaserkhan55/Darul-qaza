import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-islamicGreen text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.about")}</h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  {t("common.home")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-teal-100 hover:text-white transition-colors"
                >
                  {t("common.dashboard")}
                </button>
              </li>
              <li>
                <a href="#contact" className="text-teal-100 hover:text-white transition-colors">
                  {t("common.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm text-teal-100">
              <li>{t("footer.email")}</li>
              <li>{t("footer.phone")}</li>
              <li>{t("footer.address")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-600 pt-6 text-center space-y-2">
          <p className="text-xs sm:text-sm text-teal-100 max-w-3xl mx-auto">
            {t("legalDisclaimer.text")}
          </p>
          <p className="text-sm text-teal-100">
            {t("footer.copyright", { year: currentYear })}
          </p>
          <p className="text-xs text-teal-200">
            {t("footer.serving")}
          </p>
        </div>
      </div>
    </footer>
  );
}


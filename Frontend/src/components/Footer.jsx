import { useTranslation } from "react-i18next";
import { Scale, ShieldCheck, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-islamicGreen rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <Scale className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif text-islamicGreen leading-none">{t("common.brandUrdu")}</span>
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">{t("common.brandEnglish")}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t("home.trustText")}
            </p>
            <div className="flex items-center gap-2 text-islamicGreen">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Shariah Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">{t("footer.links.about")}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-600 hover:text-islamicGreen transition">{t("footer.links.about")}</a></li>
              <li><a href="#contact" className="text-sm text-gray-600 hover:text-islamicGreen transition">{t("footer.links.contact")}</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-islamicGreen transition">{t("footer.links.privacy")}</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-islamicGreen transition">{t("footer.links.terms")}</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">{t("home.contactUs")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-islamicGreen mt-0.5" />
                <span className="text-sm text-gray-600">{t("footer.address")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-islamicGreen" />
                <span className="text-sm text-gray-600">registry@darulqaza.org</span>
              </li>
            </ul>
          </div>

          {/* Jurisdiction */}
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6">{t("footer.jurisdiction")}</h4>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              {t("footer.jurisdictionText")}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            {t("footer.copyright", { year: currentYear })}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-islamicGreen uppercase tracking-widest">Nanded</span>
            <span className="text-[10px] font-black text-islamicGreen uppercase tracking-widest">Maharashtra</span>
            <span className="text-[10px] font-black text-islamicGreen uppercase tracking-widest">India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./en.json";
import hiTranslations from "./hi.json";
import urTranslations from "./ur.json";

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem("lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      ur: { translation: urTranslations },
    },
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Set document direction based on language
const setDocumentDirection = (lang) => {
  document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

// Set initial direction
setDocumentDirection(savedLanguage);

// Listen for language changes
i18n.on("languageChanged", (lng) => {
  setDocumentDirection(lng);
  localStorage.setItem("lang", lng);
});

export default i18n;


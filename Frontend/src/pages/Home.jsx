import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { getMyMessages, markMessageRead } from "../api/message.api";

import { FileText, Handshake, ScrollText, FileSignature, Gavel, BadgeCheck, Scale } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleStartCase = (divorceType) => {
    // Navigate to dashboard - it will handle case creation
    navigate("/dashboard", { state: { startType: divorceType } });
  };

  // Load latest unread admin/Qazi message and show as popup
  useEffect(() => {
    // ... (keep existing effect logic)
    const loadMessages = async () => {
      if (!user) return;
      try {
        const msgs = await getMyMessages(user.id);
        const unread = (msgs || []).filter((m) => !m.read);
        if (unread.length > 0) {
          const latest = unread.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          setLatestMessage(latest);
          setShowMessageModal(true);
        }
      } catch (err) {
        console.error("Failed to load messages on home", err);
      }
    };
    loadMessages();
  }, [user]);

  const steps = [
    {
      number: 1,
      title: t("home.steps.application.title"),
      description: t("home.steps.application.description"),
      icon: <FileText className="w-8 h-8 text-islamicGreen" />,
    },
    {
      number: 2,
      title: t("home.steps.resolution.title"),
      description: t("home.steps.resolution.description"),
      icon: <Handshake className="w-8 h-8 text-islamicGreen" />,
    },
    {
      number: 3,
      title: t("home.steps.agreement.title"),
      description: t("home.steps.agreement.description"),
      icon: <ScrollText className="w-8 h-8 text-islamicGreen" />,
    },
    {
      number: 4,
      title: t("home.steps.affidavits.title"),
      description: t("home.steps.affidavits.description"),
      icon: <FileSignature className="w-8 h-8 text-islamicGreen" />,
    },
    {
      number: 5,
      title: t("home.steps.review.title"),
      description: t("home.steps.review.description"),
      icon: <Gavel className="w-8 h-8 text-islamicGreen" />,
    },
    {
      number: 6,
      title: t("home.steps.certificate.title"),
      description: t("home.steps.certificate.description"),
      icon: <BadgeCheck className="w-8 h-8 text-islamicGreen" />,
    },
  ];

  const divorceTypes = [
    {
      type: "Talaq",
      title: t("home.divorceTypes.talaq.title"),
      description: t("home.divorceTypes.talaq.description"),
      details: t("home.divorceTypes.talaq.details"),
    },
    {
      type: "Khula",
      title: t("home.divorceTypes.khula.title"),
      description: t("home.divorceTypes.khula.description"),
      details: t("home.divorceTypes.khula.details"),
    },
    {
      type: "Faskh-e-Nikah",
      title: t("home.divorceTypes.faskh.title"),
      description: t("home.divorceTypes.faskh.description"),
      details: t("home.divorceTypes.faskh.details"),
    },
    {
      type: "Talaq-e-Zaujiyat",
      title: t("home.divorceTypes.zaujiyat.title"),
      description: t("home.divorceTypes.zaujiyat.description"),
      details: t("home.divorceTypes.zaujiyat.details"),
    },
    {
      type: "Virasat",
      title: t("home.divorceTypes.virasat.title"),
      description: t("home.divorceTypes.virasat.description"),
      details: t("home.divorceTypes.virasat.details"),
    },
    {
      type: "Zauj Nama Dispute",
      title: t("home.divorceTypes.zauj_nama.title"),
      description: t("home.divorceTypes.zauj_nama.description"),
      details: t("home.divorceTypes.zauj_nama.details"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-islamicBeige to-white overflow-x-hidden">
      {showMessageModal && latestMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(latestMessage.createdAt).toLocaleString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {latestMessage.title}
                </h3>
              </div>
              <button
                onClick={async () => {
                  setShowMessageModal(false);
                  try {
                    await markMessageRead(latestMessage._id);
                  } catch (err) {
                    console.error("Failed to mark message read", err);
                  }
                }}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {latestMessage.body}
            </p>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setShowMessageModal(false);
                  try {
                    await markMessageRead(latestMessage._id);
                  } catch (err) {
                    console.error("Failed to mark message read", err);
                  }
                }}
                className="bg-islamicGreen text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                {t("dashboard.messageModalClose") || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Islamic Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(15, 118, 110, 0.1) 35px, rgba(15, 118, 110, 0.1) 70px)`,
          }}
        ></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 w-full">
        {/* START DIVORCE CASE SECTION - FIRST AND MOST PROMINENT */}
        <section className="mb-12 sm:mb-16 animate-fade-in">
          <div className="bg-gradient-to-br from-white via-teal-50 to-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border-2 border-islamicGreen/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-islamicGreen/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-islamicGold/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-islamicGreen mb-4 animate-slide-up">
                  {t("home.title")}
                </h1>
                <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
                  {t("home.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {divorceTypes.map((item) => (
                  <div
                    key={item.type}
                    className={`border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all duration-300 transform ${selectedType === item.type
                      ? "border-islamicGreen bg-teal-50 shadow-lg scale-105"
                      : "border-gray-200 hover:border-teal-300 hover:shadow-md hover:scale-102"
                      }`}
                    onClick={() => setSelectedType(item.type)}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-islamicGreen mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <SignedIn>
                  <button
                    onClick={() => {
                      if (selectedType) {
                        handleStartCase(selectedType);
                      } else {
                        alert(t("home.selectDivorceType"));
                      }
                    }}
                    className={`relative bg-islamicGreen hover:bg-teal-700 text-white font-bold py-4 px-10 sm:px-12 rounded-lg shadow-xl transition-all duration-300 text-base sm:text-lg transform hover:scale-105 active:scale-95 ${!selectedType ? "animate-pulse" : ""
                      }`}
                    style={{
                      boxShadow: !selectedType
                        ? "0 0 30px rgba(15, 118, 110, 0.7)"
                        : "0 10px 25px -5px rgba(15, 118, 110, 0.5)",
                    }}
                  >
                    {selectedType
                      ? t("home.proceedWith", { type: divorceTypes.find((dt) => dt.type === selectedType)?.title })
                      : t("home.startDivorceCase")}
                    {!selectedType && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-islamicGold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-islamicGold"></span>
                      </span>
                    )}
                  </button>
                </SignedIn>
                <SignedOut>
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="relative bg-islamicGreen hover:bg-teal-700 text-white font-bold py-4 px-10 sm:px-12 rounded-lg shadow-xl transition-all duration-300 text-base sm:text-lg transform hover:scale-105 active:scale-95"
                    style={{
                      boxShadow: "0 10px 25px -5px rgba(15, 118, 110, 0.5)",
                    }}
                  >
                    {t("home.signInToStart")}
                  </button>
                </SignedOut>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Messaging Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-emerald-100">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-islamicGreen">
                {t("home.trustTitle")}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {t("home.trustText")}
              </p>
            </div>
          </div>
        </section>

        {/* Understanding Islamic Divorce Section - SECOND */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-teal-100">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-islamicGreen mb-4 sm:mb-6 text-center">
              {t("home.understandingTitle")}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4 text-sm sm:text-base">
              <p>
                {t("home.understandingText1")}
              </p>
              <p>
                {t("home.understandingText2")}
              </p>
              <p className="text-islamicGreen font-medium">
                {t("home.understandingText3")}
              </p>
            </div>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-teal-100">
            <h2 className="text-2xl sm:text-3xl font-semibold text-islamicGreen mb-8 text-center">
              {t("home.processTitle")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative bg-gradient-to-br from-teal-50 to-white rounded-xl p-4 sm:p-6 border border-teal-100"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-islamicGreen text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
                        {step.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-islamicGreen mb-1 sm:mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-teal-300 transform -translate-y-1/2">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-teal-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-teal-100">
            <h2 className="text-2xl sm:text-3xl font-semibold text-islamicGreen mb-6 text-center">
              {t("home.documentsTitle")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                <h3 className="text-lg font-semibold text-islamicGreen mb-3">
                  {t("home.documents.affidavits.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.affidavits.items.applicant")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.affidavits.items.witnesses")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.affidavits.items.supporting")}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                <h3 className="text-lg font-semibold text-islamicGreen mb-3">
                  {t("home.documents.agreement.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.agreement.items.mahr")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.agreement.items.iddat")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>{t("home.documents.agreement.items.custody")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final Official Seal/Sign Section for Realism */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-islamicGreen/10 rounded-full flex items-center justify-center mb-4">
              <Scale className="w-10 h-10 text-islamicGreen" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">{t("common.brandUrdu")}</h4>
            <p className="text-sm text-gray-500 max-w-md italic">
              "Providing accessible, technology-driven judicial services to the Muslim community while upholding the sanctity of Shariah law."
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

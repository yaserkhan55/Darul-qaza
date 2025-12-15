import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export default function Home() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleStartCase = (divorceType) => {
    // Navigate to dashboard - it will handle case creation
    navigate("/dashboard", { state: { startType: divorceType } });
  };

  const steps = [
    {
      number: 1,
      title: "Application",
      description: "Submit your divorce application with required personal and marriage details",
      icon: "📝",
    },
    {
      number: 2,
      title: "Sulah (Resolution)",
      description: "Islamic reconciliation attempt to resolve differences amicably",
      icon: "🤝",
    },
    {
      number: 3,
      title: "Agreement",
      description: "Define terms of separation including mahr, iddat, custody, and maintenance",
      icon: "📋",
    },
    {
      number: 4,
      title: "Affidavits",
      description: "Submit sworn statements from applicant, witnesses, and supporting documents",
      icon: "📜",
    },
    {
      number: 5,
      title: "Qazi Review",
      description: "Case reviewed by qualified Islamic judge (Qazi) for Shariah compliance",
      icon: "⚖️",
    },
    {
      number: 6,
      title: "Certificate",
      description: "Receive official divorce certificate upon approval",
      icon: "✅",
    },
  ];

  const divorceTypes = [
    {
      type: "TALAQ",
      title: "Talaq",
      description: "Divorce initiated by the husband according to Islamic law",
      details: "The husband pronounces talaq, followed by a waiting period (iddat) and proper procedures.",
    },
    {
      type: "KHULA",
      title: "Khula",
      description: "Divorce initiated by the wife with mutual consent",
      details: "The wife seeks khula, often involving return of mahr or other agreed terms.",
    },
    {
      type: "FASKH",
      title: "Faskh",
      description: "Judicial annulment by Qazi when reconciliation is not possible",
      details: "The Qazi dissolves the marriage when conditions are met and reconciliation fails.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-islamicBeige to-white overflow-x-hidden">
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
                  Start Your Divorce Case
                </h1>
                <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
                  Begin your journey with a dignified, Shariah-compliant process. Select the type of divorce proceeding that applies to your situation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {divorceTypes.map((item) => (
                  <div
                    key={item.type}
                    className={`border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all duration-300 transform ${
                      selectedType === item.type
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
                        alert("Please select a divorce type first");
                      }
                    }}
                    className={`relative bg-islamicGreen hover:bg-teal-700 text-white font-bold py-4 px-10 sm:px-12 rounded-lg shadow-xl transition-all duration-300 text-base sm:text-lg transform hover:scale-105 active:scale-95 ${
                      !selectedType ? "animate-pulse" : ""
                    }`}
                    style={{
                      boxShadow: !selectedType
                        ? "0 0 30px rgba(15, 118, 110, 0.7)"
                        : "0 10px 25px -5px rgba(15, 118, 110, 0.5)",
                    }}
                  >
                    {selectedType
                      ? `Proceed with ${divorceTypes.find((t) => t.type === selectedType)?.title}`
                      : "Start Divorce Case"}
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
                    Sign In to Start
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
                A Calm, Scholarly Review Process
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                All cases are reviewed by qualified Islamic scholars and processed according to
                established Islamic principles. /
                تمام کیسز مستند اسلامی علما کے زیرِ نگرانی اور معروف فقہی اصولوں کے مطابق نمٹائے جاتے ہیں۔
              </p>
            </div>
          </div>
        </section>

        {/* Understanding Islamic Divorce Section - SECOND */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-teal-100">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-islamicGreen mb-4 sm:mb-6 text-center">
              Understanding Islamic Divorce
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4 text-sm sm:text-base">
              <p>
                Dar-ul-Qaza provides a dignified, Shariah-compliant platform for
                resolving family matters according to Islamic principles. Our
                process ensures fairness, transparency, and adherence to Islamic
                law while protecting the rights of all parties involved.
              </p>
              <p>
                The Islamic divorce process is designed to first attempt
                reconciliation (Sulah) between spouses. If reconciliation is not
                possible, the process proceeds through carefully defined steps,
                ensuring all legal and religious requirements are met before a
                final decision is made by a qualified Qazi (Islamic judge).
              </p>
              <p className="text-islamicGreen font-medium">
                All cases are handled with the utmost respect, confidentiality,
                and in accordance with Islamic jurisprudence.
              </p>
            </div>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-teal-100">
            <h2 className="text-2xl sm:text-3xl font-semibold text-islamicGreen mb-8 text-center">
              The Process
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
              Required Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                <h3 className="text-lg font-semibold text-islamicGreen mb-3">
                  Affidavits
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Applicant's sworn statement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Witness affidavits (2 witnesses)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Supporting documents as required</span>
                  </li>
                </ul>
              </div>
              <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                <h3 className="text-lg font-semibold text-islamicGreen mb-3">
                  Agreement Terms
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Mahr (dower) settlement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Iddat period arrangements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-islamicGreen mt-1">•</span>
                    <span>Child custody and maintenance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Help Section */}
        <section id="contact" className="mb-12">
          <div className="bg-gradient-to-r from-islamicGreen to-teal-700 rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
              Need Help?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl mb-3">📞</div>
                <h3 className="font-semibold mb-2">Contact Us</h3>
                <p className="text-sm text-teal-100">
                  For questions about the process or case status
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-teal-100">support@darulqaza.org</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

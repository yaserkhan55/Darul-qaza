import { SignUp } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

export default function SignUpPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8 bg-islamicBeige">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-islamicGreen mb-2">
              {t("signUp.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {t("signUp.subtitle")}
            </p>
          </div>
          <div className="flex justify-center">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/dashboard"
              appearance={{
                layout: {
                  socialButtonsVariant: "blockButton",
                  socialButtonsPlacement: "top",
                },
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none w-full max-w-sm mx-auto border border-gray-100 rounded-2xl",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-islamicGreen hover:bg-teal-700 text-white border-0",
                  formButtonPrimary: "bg-islamicGreen hover:bg-teal-700 text-white",
                  formFieldInput: "border-gray-300 focus:border-islamicGreen focus:ring-islamicGreen",
                  footerActionLink: "text-islamicGreen hover:text-teal-700",
                  identityPreviewEditButton: "text-islamicGreen hover:text-teal-700",
                  formResendCodeLink: "text-islamicGreen hover:text-teal-700",
                },
                variables: {
                  colorPrimary: "#0f766e",
                  colorText: "#1f2937",
                  colorTextSecondary: "#6b7280",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#1f2937",
                },
              }}
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


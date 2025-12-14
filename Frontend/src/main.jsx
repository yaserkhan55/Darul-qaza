import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(
    "⚠️ Missing VITE_CLERK_PUBLISHABLE_KEY. Please set it in your .env file.\n" +
    "The app will still load, but authentication features will not work."
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <BrowserRouter>
        <div className="min-h-screen flex items-center justify-center bg-islamicBeige px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-islamicGreen mb-4">
              Configuration Required
            </h2>
            <p className="text-gray-600 mb-2">
              Please set <code className="bg-gray-100 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Check <code className="bg-gray-100 px-2 py-1 rounded">.env.example</code> for reference.
            </p>
          </div>
        </div>
      </BrowserRouter>
    )}
  </React.StrictMode>
);

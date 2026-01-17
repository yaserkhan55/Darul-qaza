import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import "./i18n/config";

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
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-islamicGreen mb-4">
                Configuration Required
              </h2>
            </div>
            <div className="space-y-4 text-left">
              <p className="text-gray-700">
                The <code className="bg-gray-100 px-2 py-1 rounded text-sm">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable is not set.
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="font-semibold text-islamicGreen mb-2">For Vercel Deployment:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Go to your Vercel project dashboard</li>
                  <li>Navigate to <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                  <li>Add a new variable:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li><strong>Name:</strong> <code className="bg-white px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code></li>
                      <li><strong>Value:</strong> Your Clerk publishable key (starts with <code className="bg-white px-1 rounded">pk_test_</code> or <code className="bg-white px-1 rounded">pk_live_</code>)</li>
                      <li><strong>Environment:</strong> Production, Preview, and Development</li>
                    </ul>
                  </li>
                  <li>Redeploy your application</li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">For Local Development:</h3>
                <p className="text-sm text-gray-700">
                  Create a <code className="bg-white px-1 rounded">.env</code> file in the <code className="bg-white px-1 rounded">Frontend</code> directory with:
                </p>
                <pre className="bg-gray-800 text-white p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=https://darul-qaza-backend.onrender.com/api`}
                </pre>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Get your Clerk key from{" "}
                  <a 
                    href="https://dashboard.clerk.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-islamicGreen hover:underline font-medium"
                  >
                    Clerk Dashboard
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </BrowserRouter>
    )}
  </React.StrictMode>
);

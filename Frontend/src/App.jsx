import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-islamicBeige flex flex-col overflow-x-hidden">
        <Navbar />
        <main
          className={`flex-1 ${
            !isHomePage
              ? "max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 w-full"
              : ""
          }`}
        >
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

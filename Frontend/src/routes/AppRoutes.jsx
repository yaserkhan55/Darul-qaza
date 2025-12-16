import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import AdminRoute from "../components/AdminRoute";
import SignInPage from "../pages/SignIn";
import SignUpPage from "../pages/SignUp";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/sign-in/*"
        element={
          <SignedOut>
            <SignInPage />
          </SignedOut>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <SignedOut>
            <SignUpPage />
          </SignedOut>
        }
      />
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <Dashboard />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      {/* Alias path so /Qazi also opens the same admin panel */}
      <Route
        path="/Qazi"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

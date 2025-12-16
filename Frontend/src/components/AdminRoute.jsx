import { Navigate, Outlet } from "react-router-dom";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";

const ALLOWED_ROLES = ["QAZI", "ADMIN"];

export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  // Wait for Clerk to finish loading before making any decision
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking admin access...
      </div>
    );
  }

  // Not signed in → redirect to Clerk
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Normalize role from any metadata location (public/unsafe/private)
  const role =
    (user?.publicMetadata?.role ||
      user?.unsafeMetadata?.role ||
      user?.privateMetadata?.role ||
      "")?.toString()?.toUpperCase();

  const allowed = ALLOWED_ROLES.includes(role);

  // Signed-in but not allowed → go home (no loop)
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  // Render nested routes or direct children
  return children || <Outlet />;
}


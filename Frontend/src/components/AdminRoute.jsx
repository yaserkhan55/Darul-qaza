import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const ALLOWED_ROLES = ["QAZI", "ADMIN"];

export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  // 1) Wait for Clerk to finish loading before ANY redirect
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking permissions...
      </div>
    );
  }

  // 2) After load: if not signed in, redirect safely to home
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // 3) Read role ONLY from publicMetadata.role
  const publicRole = user?.publicMetadata?.role;
  const rolesArray = Array.isArray(publicRole) ? publicRole : [publicRole];
  const normalized = rolesArray
    .filter(Boolean)
    .map((r) => r.toString().toUpperCase());
  const allowed = normalized.some((r) => ALLOWED_ROLES.includes(r));

  // Signed-in but not allowed → go home (no loop)
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  // Render nested routes or direct children
  return children || <Outlet />;
}


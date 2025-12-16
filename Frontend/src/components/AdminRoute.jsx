import { Navigate } from "react-router-dom";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";

const ALLOWED_ROLES = ["QAZI", "ADMIN"];

export default function AdminRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const role = user?.publicMetadata?.role;
  const allowed = role && ALLOWED_ROLES.includes(role);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}


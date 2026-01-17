import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { attachClerkToken } from "../api/axios";

/**
 * Component to set up Clerk token attachment to axios
 * This component should only be rendered inside ClerkProvider
 * Sets up axios to automatically attach Clerk tokens to API requests
 */
export default function ClerkAuthSetup() {
  const { isLoaded, getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && getToken) {
      // Attach token interceptor - getToken() will return null if not signed in, which is fine
      attachClerkToken(getToken);
    }
  }, [isLoaded, getToken]);

  return null; // This component doesn't render anything
}


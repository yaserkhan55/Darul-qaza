import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// Use Clerk's middleware to verify the token
// This populates req.auth with the user claims
export const protect = ClerkExpressRequireAuth({
  // Optional: Handle errors custom way, but default is 401
  onError: (err, req, res) => {
    console.error("Clerk Auth Error:", err);
    res.status(401).json({ message: "Unauthenticated", error: err.message });
  }
});

/* 
// LEGACY LOCAL JWT - DEPRECATED for Clerk
// export const protect = (req, res, next) => {
//   ...
// };
*/

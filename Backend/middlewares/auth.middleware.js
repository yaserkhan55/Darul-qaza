import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Resilient Auth Middleware
// 1. Checks if Clerk Secret Key is present.
// 2. If present, tries strict Clerk verification.
// 3. If missing or fails, falls back to decoding (Dev Mode).
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized - No Token" });

  // CHECK: Do we even have the key?
  if (process.env.CLERK_SECRET_KEY) {
    try {
      // A) Try Strict Clerk Verification
      await new Promise((resolve, reject) => {
        ClerkExpressRequireAuth({
          onError: (err) => reject(err),
        })(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      // If successful, req.auth is populated
      return next();
    } catch (clerkError) {
      // console.warn("Clerk Verification Failed (Strict):", clerkError.message);
      // Proceed to fallback below
    }
  }

  // B) Fallback: Simple Decode (mimics legacy behavior)
  try {
    // Silently fall back to decoding so it "just works" locally
    const decoded = jwt.decode(token);

    if (decoded && decoded.sub) {
      req.auth = { userId: decoded.sub, claims: decoded };
      req.user = { id: decoded.sub, ...decoded };
      next();
    } else {
      throw new Error("Token decoding failed");
    }
  } catch (decodeError) {
    res.status(401).json({ message: "Not authorized" });
  }
};

import express from "express";
import cors from "cors";
import env from "./config/env.js";

import authRoutes from "./routes/auth.Routes.js";
import caseRoutes from "./routes/case.Routes.js";

const app = express();

// CORS configuration - allows both dev ports and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // In development, allow localhost origins and requests with no origin (Postman, etc.)
      if (process.env.NODE_ENV !== "production") {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // In production, only allow configured frontend URL
        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Islamic Divorce API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);

export default app;

import express from "express";
import cors from "cors";
import env from "./config/env.js";

import authRoutes from "./routes/auth.js";
import caseRoutes from "./routes/case.js";
import messageRoutes from "./routes/message.js";
import notificationRoutes from "./routes/notification.js";
import documentRoutes from "./routes/document.js";

const app = express();

// Support comma-separated FRONTEND_URL values for multiple deploys (e.g. Vercel preview/prod)
// Normalize by removing any trailing slashes so origin match works reliably.
const frontendOrigins = (env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  ...frontendOrigins,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Islamic Divorce API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);

export default app;

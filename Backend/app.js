import express from "express";
import cors from "cors";
import env from "./config/env.js";

import authRoutes from "./routes/auth.Routes.js";
import caseRoutes from "./routes/case.Routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
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

export default app;

import express from "express";
import {
  startCase,
  saveDraft,
  getDraft,
  submitCase,
  transitionCase,
  getMyCases,
  getAllCases,
} from "../controllers/case.controller.js";
import { generateCertificatePDF } from "../controllers/pdf.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
import rateLimit from "express-rate-limit";

const createCaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 case creation requests per hour
  message: "Too many cases created from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// USER ROUTES (Protected)
router.use(protect);

router.post("/start", createCaseLimiter, startCase); // Rate Limited
router.get("/:id/draft", getDraft); // Get specific draft (resume)
router.post("/:id/draft", saveDraft); // Auto-save
router.post("/:id/submit", submitCase); // Submit (CREATED/STARTED/DRAFT -> FORM_COMPLETED)
router.get("/my", getMyCases);
router.get("/:id/certificate/pdf", generateCertificatePDF);

// ADMIN / QAZI transitions
// Ideally checking role here too, but start with protect
router.get("/admin/all", getAllCases);
router.patch("/:id/transition", transitionCase); // handles workflow steps

export default router;

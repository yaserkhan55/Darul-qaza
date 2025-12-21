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

// USER ROUTES (Protected)
router.use(protect);

router.post("/start", startCase); // Check "Single Active Case" rule
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

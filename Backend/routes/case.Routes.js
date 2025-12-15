import express from "express";
import {
  startCase,
  saveDraft,
  submitCase,
  transitionCase,
  getMyCases,
  getAllCases,
} from "../controllers/case.controller.js";
import { generateCertificatePDF } from "../controllers/pdf.controller.js";

const router = express.Router();

// USER
router.post("/start", startCase); // creates DRAFT
router.post("/:id/draft", saveDraft); // save draft data
router.post("/:id/submit", submitCase); // submit case (DRAFT -> SUBMITTED -> PENDING_REVIEW)
router.get("/my", getMyCases);
router.get("/:id/certificate/pdf", generateCertificatePDF);

// ADMIN / QAZI transitions
router.get("/admin/all", getAllCases);
router.patch("/:id/transition", transitionCase); // handles PENDING_REVIEW -> ... -> COMPLETED

export default router;

import express from "express";
import {
  startCase,
  saveDivorceForm,
  saveResolution,
  saveAgreement,
  saveAffidavits,
  getMyCases,
  getAllCases,
  approveCase,
} from "../controllers/case.controller.js";
import { generateCertificatePDF } from "../controllers/pdf.controller.js";

const router = express.Router();

// USER (DEV MODE – no auth)
router.post("/start", startCase);
router.get("/my", getMyCases);
router.post("/:id/form", saveDivorceForm);
router.post("/:id/resolution", saveResolution);
router.post("/:id/agreement", saveAgreement);
router.post("/:id/affidavits", saveAffidavits);
router.get("/:id/certificate/pdf", generateCertificatePDF);

// ADMIN / QAZI (DEV MODE)
router.get("/admin/all", getAllCases);
router.patch("/:id/approve", approveCase);

export default router;

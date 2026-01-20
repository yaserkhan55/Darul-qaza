import express from "express";
import rateLimit from "express-rate-limit";
import {
  submitDarkhast,
  approveDarkhast,
  rejectDarkhast,
  selectCaseType,
  issueNotice,
  startHearing,
  recordAttendance,
  recordStatement,
  recordArbitration,
  issueFaisla,
  closeCase,
  getMyCases,
  getAllCases,
  saveFormData,
  saveResolution,
  saveAffidavits,
  scheduleHearing,
  sendBackForCorrection,
  approveForContinue,
  getDraft,
} from "../controllers/case.js";
import { generateCertificatePDF } from "../controllers/pdf.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

const createCaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 case creation requests per hour
  message: "Too many requests, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// USER ROUTES (Protected)
router.use(protect);

router.post("/darkhast", createCaseLimiter, submitDarkhast);
router.put("/:id/select-type", selectCaseType);
router.put("/:id/save-form", saveFormData);
router.put("/:id/save-resolution", saveResolution);
router.put("/:id/save-affidavits", saveAffidavits);
router.get("/my", getMyCases);
router.get("/:id/draft", getDraft);
router.get("/:id/certificate/pdf", generateCertificatePDF);

// ADMIN / QAZI ROUTES
router.get("/admin/all", getAllCases);
router.put("/:id/approve-darkhast", approveDarkhast);
router.put("/:id/reject-darkhast", rejectDarkhast);
router.put("/:id/issue-notice", issueNotice);
router.put("/:id/schedule-hearing", scheduleHearing);
router.put("/:id/start-hearing", startHearing);
router.put("/:id/send-back", sendBackForCorrection);
router.put("/:id/approve-continue", approveForContinue);
router.put("/:id/record-attendance", recordAttendance);
router.put("/:id/record-statement", recordStatement);
router.put("/:id/record-arbitration", recordArbitration);
router.put("/:id/issue-faisla", issueFaisla);
router.put("/:id/close", closeCase);

export default router;

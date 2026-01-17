import express from "express";
import {
    getAllowedDocumentTypes,
    getDocumentsForCase,
    uploadDocument,
    approveDocument,
    rejectDocument,
    viewDocument
} from "../controllers/document.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get("/case/:caseId", getDocumentsForCase);           // Get all documents for a case
router.get("/case/:caseId/allowed", getAllowedDocumentTypes); // Get allowed document types
router.post("/case/:caseId", uploadDocument);                // Upload a document

// Admin routes
router.put("/:docId/approve", approveDocument);              // Approve document
router.put("/:docId/reject", rejectDocument);                // Reject document with reason

// Common routes
router.get("/:docId", viewDocument);                         // View single document

export default router;

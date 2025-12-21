import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";

// CASE_FLOW (Single Source of Truth)
const CASE_FLOW = {
  CREATED: "FORM",
  STARTED: "FORM",
  DRAFT: "FORM",
  FORM_COMPLETED: "RESOLUTION",
  RESOLUTION_SUCCESS: "AGREEMENT",
  RESOLUTION_FAILED: "AGREEMENT", // Fallback flow
  AGREEMENT_DONE: "AFFIDAVITS",
  AFFIDAVITS_DONE: "REVIEW",
  UNDER_REVIEW: "REVIEW",
  APPROVED: "CERTIFICATE",
};

// Strict State Transitions
const transitions = {
  CREATED: ["STARTED", "DRAFT", "FORM_COMPLETED"],
  STARTED: ["DRAFT", "FORM_COMPLETED"],
  DRAFT: ["STARTED", "FORM_COMPLETED", "REJECTED"], // Removed SUBMITTED/DRAFT
  FORM_COMPLETED: ["RESOLUTION_SUCCESS", "RESOLUTION_FAILED", "REJECTED"],
  RESOLUTION_SUCCESS: ["AGREEMENT_DONE", "APPROVED", "REJECTED"],
  RESOLUTION_FAILED: ["AGREEMENT_DONE", "APPROVED", "REJECTED"],
  AGREEMENT_DONE: ["AFFIDAVITS_DONE", "UNDER_REVIEW", "APPROVED", "REJECTED"],
  AFFIDAVITS_DONE: ["UNDER_REVIEW", "APPROVED", "REJECTED", "FORM_COMPLETED"], // Can go back to form
  UNDER_REVIEW: ["APPROVED", "REJECTED", "FORM_COMPLETED"], // Reviewer can send back
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const ADMIN_OVERRIDE_TARGETS = ["APPROVED", "REJECTED", "FORM_COMPLETED"];

const canTransition = (from, to) => {
  // Always allow admin-critical targets to avoid blocking approvals/rejections/send-backs
  if (ADMIN_OVERRIDE_TARGETS.includes(to)) return true;
  return (transitions[from] || []).includes(to);
};

const addHistory = (caseData, status, changedBy, note) => {
  caseData.history.push({
    status,
    changedBy,
    note,
    timestamp: new Date(),
  });
};

const validateIslamicLogic = (caseData, nextStatus, payload = {}) => {
  if (caseData.type === "TALAQ") {
    const count = payload.talaqCount ?? caseData.details?.talaqCount;
    if (count && (count < 1 || count > 3)) {
      throw new Error("Talaq count must be between 1 and 3.");
    }
  }
};

/**
 * START CASE (create DRAFT)
 * Single Active Case Rule Enforced
 */
export const startCase = async (req, res) => {
  try {
    const { type, details, divorceType } = req.body;
    const caseType = type || divorceType;
    const createdBy = req.user?.id || req.body.createdBy || "anonymous";

    if (!CASE_TYPES.includes(caseType)) {
      return res.status(400).json({ message: "Invalid case type" });
    }

    // 1. Single Active Case Rule
    const existingCase = await Case.findOne({
      createdBy,
      status: { $nin: ["COMPLETED", "REJECTED"] }
    });

    if (existingCase) {
      return res.status(400).json({
        code: "ACTIVE_CASE_EXISTS",
        message: "Please complete your current case first",
        caseId: existingCase._id
      });
    }

    const newCase = await Case.create({
      type: caseType,
      createdBy,
      status: "CREATED",
      details,
      history: [
        { status: "CREATED", changedBy: createdBy, timestamp: new Date(), note: "Case created" },
      ],
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SAVE DRAFT DETAILS (Auto-save)
 */
export const saveDraft = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Allow editing in DRAFT, CREATED, STARTED, or even FORM_COMPLETED if just fixing before review? 
    // Ideally just DRAFT/STARTED for pure draft logic.
    const allowEdit = ["CREATED", "STARTED", "DRAFT", "FORM_COMPLETED"].includes(caseData.status);

    if (!allowEdit)
      return res.status(400).json({ message: "Cannot edit case in this status" });

    // Update details deeply? Or merge? Mongoose mixed type usually needs careful updates.
    // For now simple top-level merge is safe for this schema.
    caseData.details = { ...caseData.details, ...req.body.details };
    // Don't auto-update status to DRAFT if it's already stricter, but if CREATED, maybe move to DRAFT?
    if (caseData.status === "CREATED") {
      caseData.status = "DRAFT";
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SUBMIT CASE (DRAFT -> FORM_COMPLETED)
 */
export const submitCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    validateIslamicLogic(caseData, "FORM_COMPLETED", caseData.details);

    const nextStatus = "FORM_COMPLETED";

    if (!canTransition(caseData.status, nextStatus)) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = nextStatus;
    addHistory(caseData, nextStatus, req.user?.id || "user", "User submitted case form");

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN / QAZI / SYSTEM: Transition case
 */
export const transitionCase = async (req, res) => {
  try {
    const { nextStatus, note, consentDocument, talaqCount, assignedQazi } = req.body;
    const caseData = await Case.findById(req.params.id);

    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (!CASE_STATUSES.includes(nextStatus))
      return res.status(400).json({ message: "Invalid status value" });

    if (!canTransition(caseData.status, nextStatus)) {
      return res.status(400).json({
        message: `Cannot move from ${caseData.status} to ${nextStatus}`,
        from: caseData.status,
        to: nextStatus,
        allowed: transitions[caseData.status] || [],
      });
    }

    validateIslamicLogic(caseData, nextStatus, { consentDocument, talaqCount });

    if (talaqCount) caseData.details = { ...caseData.details, talaqCount };
    if (consentDocument) caseData.details = { ...caseData.details, consentDocument };
    if (assignedQazi) caseData.assignedQazi = assignedQazi;

    caseData.status = nextStatus;
    addHistory(caseData, nextStatus, req.user?.id || "admin", note || "");

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET MY CASES
 */
export const getMyCases = async (req, res) => {
  try {
    const createdBy = req.user?.id || req.query.userId || "anonymous";
    const cases = await Case.find({ createdBy }).sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: GET ALL CASES
 */
export const getAllCases = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && CASE_STATUSES.includes(status)) filter.status = status;
    if (type && CASE_TYPES.includes(type)) filter.type = type;

    const cases = await Case.find(filter).sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET DRAFT (for resuming)
 */
export const getDraft = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



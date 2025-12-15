import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";

// Strict status transitions
const transitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["PENDING_HUSBAND_CONSENT", "ARBITRATION", "APPROVED", "REJECTED"],
  PENDING_HUSBAND_CONSENT: ["ARBITRATION", "APPROVED", "REJECTED"],
  ARBITRATION: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const canTransition = (from, to) => (transitions[from] || []).includes(to);

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
    if (count === 3 && nextStatus === "SUBMITTED") {
      throw new Error("Instant triple talaq submission is not allowed.");
    }
  }

  if (caseData.type === "KHULA") {
    if (nextStatus === "APPROVED") {
      const hasConsent = payload.consentDocument || caseData.details?.consentDocument;
      if (!hasConsent && caseData.status !== "ARBITRATION") {
        throw new Error("Khula approval requires husband consent or arbitration first.");
      }
    }
  }
};

/**
 * START CASE (create DRAFT)
 */
export const startCase = async (req, res) => {
  try {
    const { type, details } = req.body;
    if (!CASE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid case type" });
    }
    const createdBy = req.user?.id || req.body.createdBy || "anonymous";

    const newCase = await Case.create({
      type,
      createdBy,
      status: "DRAFT",
      details,
      history: [
        { status: "DRAFT", changedBy: createdBy, timestamp: new Date(), note: "Case created" },
      ],
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SAVE DRAFT DETAILS
 */
export const saveDraft = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Can only edit while DRAFT" });

    caseData.details = { ...caseData.details, ...req.body.details };
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SUBMIT CASE (DRAFT -> SUBMITTED -> PENDING_REVIEW)
 */
export const submitCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT cases can be submitted" });

    validateIslamicLogic(caseData, "SUBMITTED", caseData.details);

    if (!canTransition(caseData.status, "SUBMITTED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "SUBMITTED";
    addHistory(caseData, "SUBMITTED", req.user?.id || "user", "User submitted case");

    // Auto move to pending review
    if (canTransition("SUBMITTED", "PENDING_REVIEW")) {
      caseData.status = "PENDING_REVIEW";
      addHistory(caseData, "PENDING_REVIEW", "system", "Queued for review");
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN / QAZI: Transition case
 */
export const transitionCase = async (req, res) => {
  try {
    const { nextStatus, note, consentDocument, talaqCount, assignedQazi } = req.body;
    const caseData = await Case.findById(req.params.id);

    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (!CASE_STATUSES.includes(nextStatus))
      return res.status(400).json({ message: "Invalid status" });

    if (!canTransition(caseData.status, nextStatus)) {
      return res
        .status(400)
        .json({ message: `Cannot move from ${caseData.status} to ${nextStatus}` });
    }

    validateIslamicLogic(caseData, nextStatus, { consentDocument, talaqCount });

    if (talaqCount) caseData.details = { ...caseData.details, talaqCount };
    if (consentDocument) caseData.details = { ...caseData.details, consentDocument };
    if (assignedQazi) caseData.assignedQazi = assignedQazi;

    caseData.status = nextStatus;
    addHistory(caseData, nextStatus, req.user?.id || "admin", note || "");

    if (nextStatus === "COMPLETED" && caseData.history.every((h) => h.status !== "APPROVED")) {
      return res.status(400).json({ message: "Case must be APPROVED before COMPLETED." });
    }

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

import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";

// Strict status transitions
const transitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["PENDING_HUSBAND_CONSENT", "ARBITRATION", "APPROVED", "REJECTED"],
  PENDING_HUSBAND_CONSENT: ["ARBITRATION", "APPROVED", "REJECTED"],
  ARBITRATION: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const canTransition = (from, to) => (transitions[from] || []).includes(to);

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
    if (count === 3 && nextStatus === "SUBMITTED") {
      throw new Error("Instant triple talaq submission is not allowed.");
    }
  }

  if (caseData.type === "KHULA") {
    if (nextStatus === "APPROVED") {
      const hasConsent = payload.consentDocument || caseData.details?.consentDocument;
      if (!hasConsent && caseData.status !== "ARBITRATION") {
        throw new Error("Khula approval requires husband consent or arbitration first.");
      }
    }
  }
};

/**
 * START CASE (create DRAFT)
 */
export const startCase = async (req, res) => {
  try {
    const { type, details } = req.body;
    if (!CASE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid case type" });
    }
    const createdBy = req.user?.id || req.body.createdBy || "anonymous";

    const newCase = await Case.create({
      type,
      createdBy,
      status: "DRAFT",
      details,
      history: [
        { status: "DRAFT", changedBy: createdBy, timestamp: new Date(), note: "Case created" },
      ],
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SAVE DRAFT DETAILS
 */
export const saveDraft = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Can only edit while DRAFT" });

    caseData.details = { ...caseData.details, ...req.body.details };
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SUBMIT CASE (DRAFT -> SUBMITTED -> PENDING_REVIEW)
 */
export const submitCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT cases can be submitted" });

    validateIslamicLogic(caseData, "SUBMITTED", caseData.details);

    if (!canTransition(caseData.status, "SUBMITTED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "SUBMITTED";
    addHistory(caseData, "SUBMITTED", req.user?.id || "user", "User submitted case");

    // Auto move to pending review
    if (canTransition("SUBMITTED", "PENDING_REVIEW")) {
      caseData.status = "PENDING_REVIEW";
      addHistory(caseData, "PENDING_REVIEW", "system", "Queued for review");
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN / QAZI: Transition case
 */
export const transitionCase = async (req, res) => {
  try {
    const { nextStatus, note, consentDocument, talaqCount, assignedQazi } = req.body;
    const caseData = await Case.findById(req.params.id);

    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (!CASE_STATUSES.includes(nextStatus))
      return res.status(400).json({ message: "Invalid status" });

    if (!canTransition(caseData.status, nextStatus)) {
      return res
        .status(400)
        .json({ message: `Cannot move from ${caseData.status} to ${nextStatus}` });
    }

    validateIslamicLogic(caseData, nextStatus, { consentDocument, talaqCount });

    if (talaqCount) caseData.details = { ...caseData.details, talaqCount };
    if (consentDocument) caseData.details = { ...caseData.details, consentDocument };
    if (assignedQazi) caseData.assignedQazi = assignedQazi;

    caseData.status = nextStatus;
    addHistory(caseData, nextStatus, req.user?.id || "admin", note || "");

    if (nextStatus === "COMPLETED" && caseData.history.every((h) => h.status !== "APPROVED")) {
      return res.status(400).json({ message: "Case must be APPROVED before COMPLETED." });
    }

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

import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";

// Strict status transitions
const transitions = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["PENDING_HUSBAND_CONSENT", "ARBITRATION", "APPROVED", "REJECTED"],
  PENDING_HUSBAND_CONSENT: ["ARBITRATION", "APPROVED", "REJECTED"],
  ARBITRATION: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const canTransition = (from, to) => (transitions[from] || []).includes(to);

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
    if (count === 3 && nextStatus === "SUBMITTED") {
      throw new Error("Instant triple talaq submission is not allowed.");
    }
  }

  if (caseData.type === "KHULA") {
    if (nextStatus === "APPROVED") {
      const hasConsent = payload.consentDocument || caseData.details?.consentDocument;
      if (!hasConsent && caseData.status !== "ARBITRATION") {
        throw new Error("Khula approval requires husband consent or arbitration first.");
      }
    }
  }
};

/**
 * START CASE (create DRAFT)
 */
export const startCase = async (req, res) => {
  try {
    const { type, details } = req.body;
    if (!CASE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid case type" });
    }
    const createdBy = req.user?.id || req.body.createdBy || "anonymous";

    const newCase = await Case.create({
      type,
      createdBy,
      status: "DRAFT",
      details,
      history: [
        { status: "DRAFT", changedBy: createdBy, timestamp: new Date(), note: "Case created" },
      ],
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SAVE DRAFT DETAILS
 */
export const saveDraft = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Can only edit while DRAFT" });

    caseData.details = { ...caseData.details, ...req.body.details };
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SUBMIT CASE (DRAFT -> SUBMITTED -> PENDING_REVIEW)
 */
export const submitCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (caseData.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT cases can be submitted" });

    validateIslamicLogic(caseData, "SUBMITTED", caseData.details);

    if (!canTransition(caseData.status, "SUBMITTED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "SUBMITTED";
    addHistory(caseData, "SUBMITTED", req.user?.id || "user", "User submitted case");

    // Auto move to pending review
    if (canTransition("SUBMITTED", "PENDING_REVIEW")) {
      caseData.status = "PENDING_REVIEW";
      addHistory(caseData, "PENDING_REVIEW", "system", "Queued for review");
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN / QAZI: Transition case
 */
export const transitionCase = async (req, res) => {
  try {
    const { nextStatus, note, consentDocument, talaqCount, assignedQazi } = req.body;
    const caseData = await Case.findById(req.params.id);

    if (!caseData) return res.status(404).json({ message: "Case not found" });
    if (!CASE_STATUSES.includes(nextStatus))
      return res.status(400).json({ message: "Invalid status" });

    if (!canTransition(caseData.status, nextStatus)) {
      return res
        .status(400)
        .json({ message: `Cannot move from ${caseData.status} to ${nextStatus}` });
    }

    validateIslamicLogic(caseData, nextStatus, { consentDocument, talaqCount });

    if (talaqCount) caseData.details = { ...caseData.details, talaqCount };
    if (consentDocument) caseData.details = { ...caseData.details, consentDocument };
    if (assignedQazi) caseData.assignedQazi = assignedQazi;

    caseData.status = nextStatus;
    addHistory(caseData, nextStatus, req.user?.id || "admin", note || "");

    if (nextStatus === "COMPLETED" && caseData.history.every((h) => h.status !== "APPROVED")) {
      return res.status(400).json({ message: "Case must be APPROVED before COMPLETED." });
    }

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
import Case from "../models/Case.model.js";
import mongoose from "mongoose";

const DEV_USER_ID = "693db08517114d56286b53c7"; // existing user

/**
 * START CASE
 */
export const startCase = async (req, res) => {
  try {
    const { divorceType } = req.body;

    const newCase = await Case.create({
      user: DEV_USER_ID,
      divorceType,
    });

    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 1: Divorce Form
 */
export const saveDivorceForm = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const caseData = await Case.findOne({
      _id: req.params.id,
      user: DEV_USER_ID,
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (caseData.status !== "STARTED") {
      return res.status(400).json({ message: "Form already submitted" });
    }

    caseData.divorceForm = req.body;
    caseData.status = "FORM_COMPLETED";

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 2: Resolution (Sulah)
 */
export const saveResolution = async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      user: DEV_USER_ID,
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (caseData.status !== "FORM_COMPLETED") {
      return res.status(400).json({
        message: "Resolution not allowed at this stage",
      });
    }

    caseData.resolution = {
      attempted: true,
      mediatorName: req.body.mediatorName,
      result: req.body.result,
      notes: req.body.notes,
    };

    // Set status based on resolution result
    caseData.status = req.body.result === "SUCCESS" 
      ? "RESOLUTION_SUCCESS" 
      : "RESOLUTION_FAILED";
    
    await caseData.save();

    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 3: Agreement
 */
export const saveAgreement = async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      user: DEV_USER_ID,
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Agreement can proceed after resolution (success or failed)
    if (caseData.status !== "RESOLUTION_SUCCESS" && caseData.status !== "RESOLUTION_FAILED") {
      return res.status(400).json({
        message: "Agreement allowed only after resolution attempt",
      });
    }

    caseData.agreement = req.body;
    caseData.status = "AGREEMENT_DONE";

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 4: Affidavits
 */
export const saveAffidavits = async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      user: DEV_USER_ID,
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (caseData.status !== "AGREEMENT_DONE") {
      return res.status(400).json({
        message: "Affidavits allowed only after agreement",
      });
    }

    caseData.affidavits = req.body;
    caseData.status = "AFFIDAVITS_DONE";
    
    // Auto-transition to UNDER_REVIEW after affidavits are submitted
    // In production, this might be done by a separate admin action
    caseData.status = "UNDER_REVIEW";

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET MY CASES (DEV)
 */
export const getMyCases = async (req, res) => {
  try {
    const cases = await Case.find({ user: DEV_USER_ID }).sort({
      createdAt: -1,
    });

    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN / QAZI
 */
export const getAllCases = async (req, res) => {
  const cases = await Case.find().populate("user", "name email role");
  res.json(cases);
};

export const approveCase = async (req, res) => {
  const caseData = await Case.findById(req.params.id);

  if (!caseData) {
    return res.status(404).json({ message: "Case not found" });
  }

  caseData.status = "APPROVED";
  await caseData.save();

  res.json({ message: "Case approved" });
};

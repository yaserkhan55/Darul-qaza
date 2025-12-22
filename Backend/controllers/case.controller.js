import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";

// Helper to get user ID from either Clerk (req.auth.userId) or Legacy (req.user.id)
const getUserId = (req) => req.auth?.userId || req.user?.id || req.body.createdBy || "anonymous";

// CASE_FLOW (Unified Flow)
const CASE_FLOW = {
  DARKHAST_SUBMITTED: "DARKHAST",
  DARKHAST_APPROVED: "CASE_TYPE_SELECTION",
  NOTICE_SENT: "NOTICE",
  HEARING_IN_PROGRESS: "HEARING",
  ARBITRATION_IN_PROGRESS: "ARBITRATION",
  DECISION_PENDING: "DECISION",
  DECISION_APPROVED: "CERTIFICATE",
  CASE_CLOSED: "CLOSED",
};
import { createNotification } from "./notification.controller.js";

// Strict State Transitions
const transitions = {
  DARKHAST_SUBMITTED: ["DARKHAST_APPROVED", "CASE_CLOSED"],
  DARKHAST_APPROVED: ["NOTICE_SENT"],
  NOTICE_SENT: ["HEARING_IN_PROGRESS"],
  HEARING_IN_PROGRESS: ["ARBITRATION_IN_PROGRESS"],
  ARBITRATION_IN_PROGRESS: ["DECISION_PENDING", "CASE_CLOSED"],
  DECISION_PENDING: ["DECISION_APPROVED", "CASE_CLOSED"],
  DECISION_APPROVED: ["CASE_CLOSED"],
  CASE_CLOSED: [],
};

const canTransition = (from, to) => {
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

/**
 * SUBMIT DARKHAST (Application)
 */
export const submitDarkhast = async (req, res) => {
  try {
    const createdBy = getUserId(req);
    const { darkhast } = req.body;

    // Single Active Case Rule
    const existingCase = await Case.findOne({
      createdBy,
      status: { $ne: "CASE_CLOSED" }
    });

    if (existingCase) {
      return res.status(400).json({
        code: "ACTIVE_CASE_EXISTS",
        message: "You already have an active case.",
        caseId: existingCase._id
      });
    }

    const newCase = await Case.create({
      createdBy,
      status: "DARKHAST_SUBMITTED",
      darkhast,
      history: [
        { status: "DARKHAST_SUBMITTED", changedBy: createdBy, note: "Darkhast submitted" },
      ],
    });

    createNotification(createdBy, "Your Darkhast has been submitted to Qazi.", "INFO", newCase._id);
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: APPROVE DARKHAST
 */
export const approveDarkhast = async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!canTransition(caseData.status, "DARKHAST_APPROVED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "DARKHAST_APPROVED";
    addHistory(caseData, "DARKHAST_APPROVED", getUserId(req), "Darkhast approved by Qazi");
    await caseData.save();

    createNotification(caseData.createdBy, "Your Darkhast has been approved. Please select case type.", "SUCCESS", caseData._id);
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SELECT CASE TYPE (After darkhast approval)
 */
export const selectCaseType = async (req, res) => {
  try {
    const { type } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (caseData.status !== "DARKHAST_APPROVED") {
      return res.status(400).json({ message: "Darkhast must be approved first" });
    }

    if (!CASE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid case type" });
    }

    caseData.type = type;
    // Note: User doesn't change status, admin changes it by issuing notice
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: ISSUE NOTICE
 */
export const issueNotice = async (req, res) => {
  try {
    const { hearingDate, notes } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!caseData.type) {
      return res.status(400).json({ message: "Case type must be selected before issuing notice" });
    }

    caseData.status = "NOTICE_SENT";
    caseData.notice = { issuedAt: new Date(), hearingDate, notes };
    addHistory(caseData, "NOTICE_SENT", getUserId(req), "Notice issued, hearing date fixed");
    await caseData.save();

    createNotification(caseData.createdBy, `Notice issued. Hearing scheduled for ${new Date(hearingDate).toLocaleDateString()}`, "INFO", caseData._id);
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: RECORD ATTENDANCE & HEARING
 */
export const startHearing = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!canTransition(caseData.status, "HEARING_IN_PROGRESS")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "HEARING_IN_PROGRESS";
    addHistory(caseData, "HEARING_IN_PROGRESS", getUserId(req), "Hearing started");
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { hazri } = req.body; // { applicantPresent, respondentPresent, qaziRemarks, signatureHash }
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.attendance.push(hazri);
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const recordStatement = async (req, res) => {
  try {
    const { statement } = req.body; // { applicantStatement, respondentStatement, qaziNotes }
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.hearingStatements.push(statement);
    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: ARBITRATION (Sulh)
 */
export const recordArbitration = async (req, res) => {
  try {
    const { result, notes } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.arbitration = { date: new Date(), result, notes };

    if (result === "SUCCESS") {
      caseData.status = "CASE_CLOSED";
      addHistory(caseData, "CASE_CLOSED", getUserId(req), "Arbitration successful, case closed");
    } else {
      caseData.status = "DECISION_PENDING";
      addHistory(caseData, "DECISION_PENDING", getUserId(req), "Arbitration failed, moving to decision");
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: ISSUE FAISLA (Order Sheet)
 */
export const issueFaisla = async (req, res) => {
  try {
    const { faisla } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.faisla = { ...faisla, decisionDate: new Date() };
    caseData.status = "DECISION_APPROVED";
    addHistory(caseData, "DECISION_APPROVED", getUserId(req), "Final Faisla issued");
    await caseData.save();

    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: CLOSE CASE (Generate Certificate)
 */
export const closeCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.status = "CASE_CLOSED";
    addHistory(caseData, "CASE_CLOSED", getUserId(req), "Case closed and certificate generated");
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
    const createdBy = getUserId(req);
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



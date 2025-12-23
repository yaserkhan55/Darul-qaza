import Case, { CASE_STATUSES, CASE_TYPES } from "../models/Case.model.js";
import Message from "../models/Message.model.js";

// Helper to get user ID from either Clerk (req.auth.userId) or Legacy (req.user.id)
const getUserId = (req) => req.auth?.userId || req.user?.id || req.body.createdBy || "anonymous";

// CASE_FLOW (Unified Flow)
const CASE_FLOW = {
  DARKHAST_SUBMITTED: "DARKHAST",
  DARKHAST_APPROVED: "CASE_TYPE_SELECTION",
  NOTICE_ISSUED: "NOTICE",
  HEARING_SCHEDULED: "HEARING",
  HEARING_COMPLETED: "ARBITRATION",
  ARBITRATION_IN_PROGRESS: "ARBITRATION",
  DECISION_PENDING: "DECISION",
  CASE_CLOSED: "CLOSED",
};
import { createNotification } from "./notification.controller.js";

// Strict State Transitions
const transitions = {
  DARKHAST_SUBMITTED: ["DARKHAST_APPROVED", "DARKHAST_REJECTED", "CASE_CLOSED"],
  DARKHAST_REJECTED: ["DARKHAST_APPROVED", "CASE_CLOSED"],
  DARKHAST_APPROVED: ["NOTICE_ISSUED"],
  NOTICE_ISSUED: ["HEARING_SCHEDULED"],
  HEARING_SCHEDULED: ["HEARING_COMPLETED"],
  HEARING_COMPLETED: ["ARBITRATION_IN_PROGRESS"],
  ARBITRATION_IN_PROGRESS: ["DECISION_PENDING", "CASE_CLOSED"],
  DECISION_PENDING: ["CASE_CLOSED"],
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

    // Annual Reset Logic for Case ID
    const currentYear = new Date().getFullYear();
    const lastCase = await Case.findOne({ year: currentYear }).sort({ sequentialId: -1 });
    const nextId = (lastCase?.sequentialId || 0) + 1;
    const displayId = `DQ/${currentYear}/${nextId.toString().padStart(3, '0')}`;

    const newCase = await Case.create({
      createdBy,
      status: "DARKHAST_SUBMITTED",
      darkhast,
      sequentialId: nextId,
      year: currentYear,
      displayId,
      caseId: displayId,
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
    const { adminMessage } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!canTransition(caseData.status, "DARKHAST_APPROVED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    const previousStatus = caseData.status;
    caseData.status = "DARKHAST_APPROVED";
    addHistory(caseData, "DARKHAST_APPROVED", getUserId(req), adminMessage || "Darkhast approved by Qazi");
    await caseData.save();

    await createNotification(caseData.createdBy, "Your Darkhast has been approved. Please select case type.", "SUCCESS", caseData._id);

    // If admin provided a specific message, send it as a formal message too
    if (adminMessage) {
      await Message.create({
        caseId: caseData._id,
        recipientId: caseData.createdBy,
        title: "Darkhast Approved",
        body: adminMessage,
        senderId: getUserId(req),
        senderName: "Qazi Dar-ul-Qaza"
      });
    }

    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: REJECT DARKHAST
 */
export const rejectDarkhast = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminMessage } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!canTransition(caseData.status, "DARKHAST_REJECTED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "DARKHAST_REJECTED";
    addHistory(caseData, "DARKHAST_REJECTED", getUserId(req), adminMessage || "Darkhast rejected for correction");
    await caseData.save();

    await createNotification(caseData.createdBy, "Your Darkhast needs correction. Please check messages.", "WARNING", caseData._id);

    if (adminMessage) {
      await Message.create({
        caseId: caseData._id,
        recipientId: caseData.createdBy,
        title: "Darkhast Correction Required",
        body: adminMessage,
        senderId: getUserId(req),
        senderName: "Qazi Dar-ul-Qaza"
      });
    }

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

    caseData.status = "NOTICE_ISSUED";
    caseData.notice = { issuedAt: new Date(), hearingDate, notes };
    addHistory(caseData, "NOTICE_ISSUED", getUserId(req), "Notice issued, hearing date fixed");
    await caseData.save();

    createNotification(caseData.createdBy, `Notice issued. Hearing scheduled for ${new Date(hearingDate).toLocaleDateString()}`, "INFO", caseData._id);
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: SCHEDULE HEARING
 */
export const scheduleHearing = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!canTransition(caseData.status, "HEARING_SCHEDULED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "HEARING_SCHEDULED";
    addHistory(caseData, "HEARING_SCHEDULED", getUserId(req), "Hearing scheduled");
    await caseData.save();
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

    // Transition from NOTICE_ISSUED or HEARING_SCHEDULED to HEARING_SCHEDULED (logic depends on how detailed we want)
    // Actually user wants HEARING_SCHEDULED -> HEARING_COMPLETED flow implicitly or explicitly.
    // Let's allow NOTICE_ISSUED -> HEARING_SCHEDULED
    if (caseData.status === "NOTICE_ISSUED") {
      caseData.status = "HEARING_SCHEDULED";
      addHistory(caseData, "HEARING_SCHEDULED", getUserId(req), "Hearing session initialized");
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { hazri } = req.body; // { presentParties, signatures, qaziRemarks }
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

    // If statements recorded, we can move to HEARING_COMPLETED if Qazi decides
    // But let's allow it to be manual via separate call or just auto-transition if needed.
    // User wants: HEARING_SCHEDULED -> HEARING_COMPLETED
    if (caseData.status === "HEARING_SCHEDULED") {
      caseData.status = "HEARING_COMPLETED";
      addHistory(caseData, "HEARING_COMPLETED", getUserId(req), "Hearing records finalized");
    }

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

    // Ensure we are in a state to record arbitration
    // HEARING_COMPLETED -> ARBITRATION_IN_PROGRESS
    if (caseData.status === "HEARING_COMPLETED") {
      caseData.status = "ARBITRATION_IN_PROGRESS";
    }

    caseData.arbitration = { date: new Date(), result, notes };

    if (result === "SUCCESS") {
      caseData.status = "CASE_CLOSED";
      addHistory(caseData, "CASE_CLOSED", getUserId(req), "Arbitration successful (Sulh), case closed");
    } else {
      caseData.status = "DECISION_PENDING";
      addHistory(caseData, "DECISION_PENDING", getUserId(req), "Arbitration failed, moving to final decision");
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
    caseData.status = "CASE_CLOSED";
    addHistory(caseData, "CASE_CLOSED", getUserId(req), "Final Faisla issued, case closed");
    await caseData.save();

    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: CLOSE CASE (Manual/Withdrawal)
 */
export const closeCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    caseData.status = "CASE_CLOSED";
    addHistory(caseData, "CASE_CLOSED", getUserId(req), note || "Case closed by Qazi");
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



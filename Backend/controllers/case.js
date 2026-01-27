import Case, { CASE_STATUSES, CASE_TYPES } from "../models/case.js";
import Message from "../models/message.js";
import { assignFileNumberToUser } from "../services/fileNumberService.js";

// Helper to get user ID from either Clerk (req.auth.userId) or Legacy (req.user.id)
const getUserId = (req) => req.auth?.userId || req.user?.id || req.body.createdBy || "anonymous";

// CASE_FLOW (Unified Flow)
const CASE_FLOW = {
  DARKHAST_SUBMITTED: "DARKHAST",
  DARKHAST_APPROVED: "CASE_TYPE_SELECTION",
  FORM_COMPLETED: "FORM",
  NOTICE_ISSUED: "NOTICE",
  HEARING_SCHEDULED: "HEARING",
  HEARING_COMPLETED: "ARBITRATION",
  ARBITRATION_IN_PROGRESS: "ARBITRATION",
  DECISION_PENDING: "DECISION",
  CASE_CLOSED: "CLOSED",
};
import { createNotification } from "./notification.js";

// Strict State Transitions
const transitions = {
  DARKHAST_SUBMITTED: ["DARKHAST_APPROVED", "DARKHAST_REJECTED", "CASE_CLOSED"],
  DARKHAST_REJECTED: ["DARKHAST_APPROVED", "CASE_CLOSED"],
  DARKHAST_APPROVED: ["FORM_COMPLETED", "NEEDS_CORRECTION"],
  FORM_COMPLETED: ["RESOLUTION_PENDING", "NEEDS_CORRECTION", "UNDER_REVIEW", "APPROVED_FOR_CONTINUE"],
  NEEDS_CORRECTION: ["DARKHAST_APPROVED", "FORM_COMPLETED", "APPROVED_FOR_CONTINUE"],
  APPROVED_FOR_CONTINUE: ["FORM_COMPLETED", "RESOLUTION_PENDING"],
  RESOLUTION_PENDING: ["RESOLUTION_SUCCESS", "RESOLUTION_FAILED"],
  RESOLUTION_SUCCESS: ["CASE_CLOSED"], // Admin must explicitly allow continuation
  RESOLUTION_FAILED: ["UNDER_REVIEW"], // Proceed to Agreement/Affidavits
  UNDER_REVIEW: ["APPROVED", "NEEDS_CORRECTION", "APPROVED_FOR_CONTINUE"],
  APPROVED: ["NOTICE_ISSUED", "CASE_CLOSED"],
  NOTICE_ISSUED: ["HEARING_SCHEDULED", "NOTICE_SENT"],
  NOTICE_SENT: ["HEARING_SCHEDULED"],
  HEARING_SCHEDULED: ["HEARING_IN_PROGRESS", "HEARING_COMPLETED"],
  HEARING_IN_PROGRESS: ["HEARING_COMPLETED"],
  HEARING_COMPLETED: ["ARBITRATION_IN_PROGRESS"],
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
    const { adminMessage, decisionComment } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Require decision comment
    if (!decisionComment || !decisionComment.trim()) {
      return res.status(400).json({ message: "decisionComment is required for this action" });
    }

    if (!canTransition(caseData.status, "DARKHAST_APPROVED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    const previousStatus = caseData.status;
    caseData.status = "DARKHAST_APPROVED";

    // Use centralized service to get or generate the unique File Number
    // This ensures one user has only one file number across all cases.
    try {
      caseData.fileNumber = await assignFileNumberToUser(caseData.createdBy);
    } catch (assignError) {
      console.error("File Number Assignment Error:", assignError);
      // Fallback to legacy format if service fails, to avoid blocking approval
      if (!caseData.fileNumber) {
        caseData.fileNumber = `${caseData.sequentialId}/${caseData.year}`;
      }
    }

    // Tracking approval metadata
    caseData.approvedAt = new Date();
    caseData.approvedBy = getUserId(req);

    // Store decision comment
    caseData.decisionComment = {
      comment: decisionComment,
      decisionBy: getUserId(req),
      decisionAt: new Date(),
    };

    addHistory(caseData, "DARKHAST_APPROVED", getUserId(req), decisionComment || adminMessage || "Darkhast approved by Qazi");
    await caseData.save();

    await createNotification(caseData.createdBy, `Your Darkhast has been approved. File Number: ${caseData.fileNumber}`, "SUCCESS", caseData._id);

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
    const { adminMessage, decisionComment } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Require decision comment
    if (!decisionComment || !decisionComment.trim()) {
      return res.status(400).json({ message: "decisionComment is required for this action" });
    }

    if (!canTransition(caseData.status, "DARKHAST_REJECTED")) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    caseData.status = "DARKHAST_REJECTED";

    // Store decision comment
    caseData.decisionComment = {
      comment: decisionComment,
      decisionBy: getUserId(req),
      decisionAt: new Date(),
    };

    addHistory(caseData, "DARKHAST_REJECTED", getUserId(req), decisionComment || adminMessage || "Darkhast rejected for correction");
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
 * SAVE FORM DATA (Talaq/Khula forms)
 */
export const saveFormData = async (req, res) => {
  try {
    const { formData } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Allow form editing if status is DARKHAST_APPROVED, NEEDS_CORRECTION, or APPROVED_FOR_CONTINUE
    const editableStatuses = ["DARKHAST_APPROVED", "NEEDS_CORRECTION", "APPROVED_FOR_CONTINUE"];
    if (!editableStatuses.includes(caseData.status)) {
      return res.status(400).json({ message: `Case must be in ${editableStatuses.join(", ")} status to edit form` });
    }

    if (!caseData.type) {
      return res.status(400).json({ message: "Case type must be selected first" });
    }

    // Ensure darkhast object exists
    if (!caseData.darkhast) {
      caseData.darkhast = {};
    }

    // Save form data to darkhast object
    if (caseData.type === "Talaq") {
      caseData.darkhast.husbandName = formData.husbandName;
      caseData.darkhast.wifeName = formData.wifeName;
      caseData.darkhast.nikahDate = formData.nikahDate ? new Date(formData.nikahDate) : caseData.darkhast.nikahDate;
      caseData.darkhast.nikahPlace = formData.nikahPlace;
      caseData.darkhast.talaqCount = formData.talaqCount;
      caseData.darkhast.talaqIntentionConfirmed = formData.talaqIntentionConfirmed;
      caseData.darkhast.iddatAcknowledgement = formData.iddatAcknowledgement;
      caseData.darkhast.talaqDeclaration = formData.talaqDeclaration;
    } else if (caseData.type === "Khula") {
      caseData.darkhast.wifeName = formData.wifeName;
      caseData.darkhast.husbandName = formData.husbandName;
      caseData.darkhast.nikahDate = formData.nikahDate ? new Date(formData.nikahDate) : caseData.darkhast.nikahDate;
      caseData.darkhast.khulaReason = formData.reasonForKhula;
      caseData.darkhast.mahrReturn = formData.compensationMahrReturn;
      caseData.darkhast.consentConfirmation = formData.consentConfirmation;
      caseData.darkhast.khulaDeclaration = formData.khulaDeclaration;
    }

    // Transition to FORM_COMPLETED when form is submitted/resubmitted
    // Both NEEDS_CORRECTION and APPROVED_FOR_CONTINUE should transition to FORM_COMPLETED on resubmission
    const previousStatus = caseData.status;
    if (caseData.status === "APPROVED_FOR_CONTINUE" || caseData.status === "NEEDS_CORRECTION") {
      // User is resubmitting after correction or approval - move back to FORM_COMPLETED for admin review
      caseData.status = "FORM_COMPLETED";
      addHistory(caseData, "FORM_COMPLETED", getUserId(req), `${caseData.type} form resubmitted after ${previousStatus === "NEEDS_CORRECTION" ? "correction" : "approval"}`);
    } else if (canTransition(caseData.status, "FORM_COMPLETED")) {
      caseData.status = "FORM_COMPLETED";
      addHistory(caseData, "FORM_COMPLETED", getUserId(req), `${caseData.type} form completed`);
    } else {
      return res.status(400).json({ message: "Invalid transition from current status" });
    }

    // After form completion, transition to RESOLUTION_PENDING (mandatory Resolution/Sulh step)
    if (caseData.status === "FORM_COMPLETED" && canTransition("FORM_COMPLETED", "RESOLUTION_PENDING")) {
      caseData.status = "RESOLUTION_PENDING";
      addHistory(caseData, "RESOLUTION_PENDING", getUserId(req), "Resolution (Sulh) step required");
    }

    await caseData.save();

    createNotification(caseData.createdBy, `Your ${caseData.type} form has been ${caseData.status === "APPROVED_FOR_CONTINUE" ? "updated" : "submitted successfully"}.`, "SUCCESS", caseData._id);
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
    const {
      hearingDate,
      hearingTime,
      mode,
      locationOrLink,
      notes, // legacy field kept for backward compatibility
      notesByQazi, // preferred new field name
    } = req.body;
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Allow initial notice from FORM_COMPLETED and controlled updates while in notice/hearing phase
    if (
      caseData.status === "FORM_COMPLETED" &&
      !canTransition(caseData.status, "NOTICE_ISSUED")
    ) {
      return res.status(400).json({ message: "Invalid transition" });
    }

    if (caseData.status === "FORM_COMPLETED") {
      caseData.status = "NOTICE_ISSUED";
      addHistory(
        caseData,
        "NOTICE_ISSUED",
        getUserId(req),
        "Notice issued, hearing date fixed"
      );
    } else if (
      !["NOTICE_ISSUED", "HEARING_SCHEDULED", "HEARING_IN_PROGRESS"].includes(
        caseData.status
      )
    ) {
      return res.status(400).json({
        message:
          "Notice/hearing details can only be managed after the form is completed and before the case moves to arbitration/decision",
      });
    }

    // Keep legacy notice object for backwards compatibility
    caseData.notice = { issuedAt: new Date(), hearingDate, notes: notes || notesByQazi };

    // Populate structured hearing object for user dashboards
    caseData.hearing = {
      hearingDate,
      hearingTime: hearingTime || caseData.hearing?.hearingTime || "",
      mode: mode || caseData.hearing?.mode || "IN_PERSON",
      locationOrLink:
        locationOrLink || caseData.hearing?.locationOrLink || "",
      notesByQazi: notesByQazi || notes || caseData.hearing?.notesByQazi || "",
    };

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
    const { id } = req.params;
    const { hearingDate, hearingTime, hearingMode, hearingNotes, locationOrLink } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (!hearingDate || !hearingTime || !hearingMode) {
      return res.status(400).json({ message: "hearingDate, hearingTime, and hearingMode are required" });
    }

    const dateObj = new Date(hearingDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid hearingDate format" });
    }

    if (!["ONLINE", "IN_PERSON"].includes(hearingMode)) {
      return res.status(400).json({ message: "hearingMode must be ONLINE or IN_PERSON" });
    }

    // Update hearing object
    caseData.hearing = {
      hearingDate: dateObj,
      hearingTime,
      mode: hearingMode,
      locationOrLink: locationOrLink || "",
      notesByQazi: hearingNotes || "",
    };

    // Update status if not already scheduled
    if (caseData.status !== "HEARING_SCHEDULED" && canTransition(caseData.status, "HEARING_SCHEDULED")) {
      caseData.status = "HEARING_SCHEDULED";
      addHistory(caseData, "HEARING_SCHEDULED", getUserId(req), `Hearing scheduled: ${hearingDate} at ${hearingTime} (${hearingMode})`);
    } else {
      addHistory(caseData, "HEARING_SCHEDULED", getUserId(req), `Hearing details updated: ${hearingDate} at ${hearingTime} (${hearingMode})`);
    }

    await caseData.save();

    await createNotification(
      caseData.createdBy,
      `Hearing scheduled: ${dateObj.toLocaleDateString()} at ${hearingTime} (${hearingMode})`,
      "INFO",
      caseData._id
    );

    res.json(caseData);
  } catch (err) {
    console.error("Schedule Hearing Error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
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
 * SAVE RESOLUTION / SULH (Mandatory step after form submission)
 */
export const saveResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, resolutionOutcome } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    if (caseData.status !== "RESOLUTION_PENDING") {
      return res.status(400).json({ message: "Case must be in RESOLUTION_PENDING status" });
    }

    if (!resolutionNotes || !resolutionOutcome) {
      return res.status(400).json({ message: "resolutionNotes and resolutionOutcome are required" });
    }

    if (!["RESOLUTION_SUCCESS", "RESOLUTION_FAILED"].includes(resolutionOutcome)) {
      return res.status(400).json({ message: "resolutionOutcome must be RESOLUTION_SUCCESS or RESOLUTION_FAILED" });
    }

    // Save resolution data
    caseData.resolution = {
      resolutionNotes,
      resolutionOutcome,
      resolutionCompletedAt: new Date(),
    };

    // Transition based on outcome
    if (resolutionOutcome === "RESOLUTION_SUCCESS") {
      caseData.status = "RESOLUTION_SUCCESS";
      addHistory(caseData, "RESOLUTION_SUCCESS", getUserId(req), "Reconciliation (Sulh) achieved. Case resolved.");
      await createNotification(caseData.createdBy, "Reconciliation (Sulh) achieved. Your case has been resolved.", "SUCCESS", caseData._id);
    } else {
      caseData.status = "RESOLUTION_FAILED";
      addHistory(caseData, "RESOLUTION_FAILED", getUserId(req), "Reconciliation (Sulh) failed. Proceeding with case.");
      await createNotification(caseData.createdBy, "Reconciliation attempt completed. You may proceed with the next step.", "INFO", caseData._id);
    }

    await caseData.save();
    res.json(caseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN: SEND BACK FOR CORRECTION (After form submission)
 */
export const sendBackForCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      adminMessage,
      reasonForCorrection,
      guidanceForNextStep,
      decisionComment, // Required decision comment
    } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Require decision comment
    if (!decisionComment || !decisionComment.trim()) {
      return res.status(400).json({ message: "decisionComment is required for this action" });
    }

    // Allow transition from FORM_COMPLETED, UNDER_REVIEW, or DARKHAST_APPROVED
    if (!canTransition(caseData.status, "NEEDS_CORRECTION")) {
      return res.status(400).json({ message: "Invalid transition to NEEDS_CORRECTION" });
    }

    caseData.status = "NEEDS_CORRECTION";

    // Store structured admin notes on the case for user-facing guidance
    caseData.adminNotes = {
      reasonForCorrection: reasonForCorrection || adminMessage || decisionComment,
      guidanceForNextStep:
        guidanceForNextStep ||
        "Please review the Qazi's guidance and update the form below, then resubmit.",
      lastUpdatedBy: getUserId(req),
      lastUpdatedAt: new Date(),
    };

    // Store decision comment
    caseData.decisionComment = {
      comment: decisionComment,
      decisionBy: getUserId(req),
      decisionAt: new Date(),
    };

    addHistory(
      caseData,
      "NEEDS_CORRECTION",
      getUserId(req),
      decisionComment || adminMessage || "Case sent back for correction"
    );
    await caseData.save();

    await createNotification(caseData.createdBy, "Your case has been returned for correction. Please review and update your form.", "WARNING", caseData._id);

    if (adminMessage) {
      await Message.create({
        caseId: caseData._id,
        recipientId: caseData.createdBy,
        title: "Correction Required",
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
 * ADMIN: APPROVE FOR CONTINUE (After form submission)
 */
export const approveForContinue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      adminMessage,
      guidanceForNextStep,
    } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Allow transition from FORM_COMPLETED, UNDER_REVIEW, or NEEDS_CORRECTION
    if (!canTransition(caseData.status, "APPROVED_FOR_CONTINUE")) {
      return res.status(400).json({ message: "Invalid transition to APPROVED_FOR_CONTINUE" });
    }

    caseData.status = "APPROVED_FOR_CONTINUE";

    // Update admin guidance for the next step, visible to the user above forms
    caseData.adminNotes = {
      reasonForCorrection: "",
      guidanceForNextStep:
        guidanceForNextStep ||
        adminMessage ||
        "Your case has been reviewed. Please proceed with the next step as indicated on this page.",
      lastUpdatedBy: getUserId(req),
      lastUpdatedAt: new Date(),
    };

    addHistory(
      caseData,
      "APPROVED_FOR_CONTINUE",
      getUserId(req),
      adminMessage || "Case approved for continuation"
    );
    await caseData.save();

    await createNotification(caseData.createdBy, "Your case has been reviewed. You may now continue with the next step.", "SUCCESS", caseData._id);

    if (adminMessage) {
      await Message.create({
        caseId: caseData._id,
        recipientId: caseData.createdBy,
        title: "Case Approved for Continue",
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
 * SAVE AFFIDAVITS (Mandatory before UNDER_REVIEW)
 */
export const saveAffidavits = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicantAffidavit, respondentAffidavit, witnessAffidavits, nikahnama, idProof } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ message: "Case not found" });

    // Must be in RESOLUTION_FAILED status to upload affidavits
    if (caseData.status !== "RESOLUTION_FAILED") {
      return res.status(400).json({ message: "Affidavits can only be uploaded after Resolution (Sulh) step is completed with FAILED outcome" });
    }

    if (!caseData.type) {
      return res.status(400).json({ message: "Case type must be selected" });
    }

    // Validate required affidavits based on case type
    if (caseData.type === "Talaq") {
      // Talaq: Husband affidavit + at least 1 witness required
      if (!applicantAffidavit?.url) {
        return res.status(400).json({ message: "Husband affidavit is required for Talaq cases" });
      }
      if (!witnessAffidavits || witnessAffidavits.length < 1 || !witnessAffidavits[0]?.url) {
        return res.status(400).json({ message: "At least one witness affidavit is required for Talaq cases" });
      }
    } else if (caseData.type === "Khula") {
      // Khula: Wife affidavit + at least 1 witness required
      if (!applicantAffidavit?.url) {
        return res.status(400).json({ message: "Wife affidavit is required for Khula cases" });
      }
      if (!witnessAffidavits || witnessAffidavits.length < 1 || !witnessAffidavits[0]?.url) {
        return res.status(400).json({ message: "At least one witness affidavit is required for Khula cases" });
      }
    }

    // Save affidavits
    caseData.affidavits = {
      applicantAffidavit: applicantAffidavit || caseData.affidavits?.applicantAffidavit,
      respondentAffidavit: respondentAffidavit || caseData.affidavits?.respondentAffidavit,
      witnessAffidavits: witnessAffidavits || caseData.affidavits?.witnessAffidavits || [],
      nikahnama: nikahnama || caseData.affidavits?.nikahnama,
      idProof: idProof || caseData.affidavits?.idProof,
    };

    // Transition to UNDER_REVIEW after required affidavits are uploaded
    if (canTransition(caseData.status, "UNDER_REVIEW")) {
      caseData.status = "UNDER_REVIEW";
      addHistory(caseData, "UNDER_REVIEW", getUserId(req), "Required affidavits uploaded. Case submitted for Qazi review.");
      await createNotification(caseData.createdBy, "Your affidavits have been uploaded. Case is now under Qazi review.", "INFO", caseData._id);
    }

    await caseData.save();
    res.json(caseData);
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



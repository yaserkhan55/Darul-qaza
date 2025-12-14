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

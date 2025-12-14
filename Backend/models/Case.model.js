import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    divorceType: {
      type: String,
      enum: ["TALAQ", "KHULA", "FASKH"],
      required: true,
    },

    // STEP 1: Divorce Form
    divorceForm: {
      husbandName: String,
      wifeName: String,
      cnic: String,
      marriageDate: Date,
      address: String,
    },

    // STEP 2: Islamic Resolution (Sulah)
    resolution: {
      attempted: {
        type: Boolean,
        default: false,
      },
      mediatorName: String,
      result: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
      },
      notes: String,
    },

    // STEP 3: Agreement
    agreement: {
      mehr: String,
      iddat: String,
      custody: String,
      maintenance: String,
    },

    // STEP 4: Affidavits
    affidavits: {
      applicantAffidavit: {
        type: Boolean,
        default: false,
      },
      witnessAffidavit: {
        type: Boolean,
        default: false,
      },
      supportAffidavit: {
        type: Boolean,
        default: false,
      },
    },

    status: {
      type: String,
      enum: [
        "STARTED",
        "FORM_COMPLETED",
        "RESOLUTION_SUCCESS",
        "RESOLUTION_FAILED",
        "AGREEMENT_DONE",
        "AFFIDAVITS_DONE",
        "UNDER_REVIEW",
        "APPROVED",
      ],
      default: "STARTED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);

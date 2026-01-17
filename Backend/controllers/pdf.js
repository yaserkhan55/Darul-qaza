import PDFDocument from "pdfkit";
import Case from "../models/case.js";

const DEV_USER_ID = "693db08517114d56286b53c7";

export const generateCertificatePDF = async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      user: DEV_USER_ID,
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (caseData.status !== "APPROVED") {
      return res.status(400).json({ message: "Certificate not available yet" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=divorce-certificate-${caseData._id.slice(-8)}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(20).text("دار القضاء", { align: "center" });
    doc.fontSize(16).text("Dar-ul-Qaza", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("Islamic Family Resolution Platform", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(18).text("CERTIFICATE OF DIVORCE", { align: "center", underline: true });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Case ID: ${caseData._id}`, { align: "left" });
    doc.text(`Divorce Type: ${caseData.divorceType}`, { align: "left" });
    doc.moveDown();

    if (caseData.divorceForm) {
      doc.text(`Husband Name: ${caseData.divorceForm.husbandName || "N/A"}`, { align: "left" });
      doc.text(`Wife Name: ${caseData.divorceForm.wifeName || "N/A"}`, { align: "left" });
      if (caseData.divorceForm.cnic) {
        doc.text(`CNIC: ${caseData.divorceForm.cnic}`, { align: "left" });
      }
      doc.moveDown();
    }

    doc.text(`Date of Approval: ${new Date(caseData.updatedAt).toLocaleDateString()}`, {
      align: "left",
    });
    doc.moveDown(2);

    doc.text(
      "This certificate is issued in accordance with Islamic Shariah law and confirms the legal dissolution of marriage.",
      { align: "center" }
    );
    doc.moveDown(2);

    doc.text("Verified and Approved by Qazi", { align: "center" });
    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      { align: "center" }
    );

    // Finalize PDF
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


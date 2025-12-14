export const saveAffidavits = async (req, res) => {
    const caseData = await Case.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
  
    if (!caseData)
      return res.status(404).json({ message: "Case not found" });
  
    if (caseData.status !== "AGREEMENT_DONE") {
      return res.status(400).json({
        message: "Affidavits allowed only after agreement",
      });
    }
  
    caseData.affidavits = req.body;
    caseData.status = "AFFIDAVITS_DONE";
  
    await caseData.save();
  
    res.json({
      message: "Affidavits submitted",
      status: caseData.status,
    });
  };
  
const express = require("express");
const router = express.Router();
const PresentationEvaluation = require("../models/PresentationEvaluation");

// POST: Submit Form A.4
router.post("/a4/submit", async (req, res) => {
  try {
    const data = req.body;
    const newRecord = new PresentationEvaluation(data);
    await newRecord.save();
    res.status(201).json({ message: "Form A.4 submitted successfully!" });
  } catch (error) {
    console.error("Error saving A.4:", error);
    res.status(500).json({ error: "Failed to save Form A.4" });
  }
});

// GET: Fetch A.4 form by Internee Email (or Sooner ID)
router.get("/a4/find", async (req, res) => {
  try {
    const { interneeEmail, interneeID } = req.query;
    const filter = interneeEmail ? { interneeEmail } : { interneeID };
    const record = await PresentationEvaluation.findOne(filter);
    if (!record) return res.status(404).json({ message: "No Form A.4 found" });
    res.json(record);
  } catch (error) {
    console.error("Error retrieving A.4:", error);
    res.status(500).json({ error: "Failed to fetch Form A.4" });
  }
});

module.exports = router;

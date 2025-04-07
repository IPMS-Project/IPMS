const express = require("express");
const router = express.Router();
const { insertFormData } = require("../services/insertData"); 

router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;
    // Send form data to insertData.js function
    await insertFormData(formData);
    res.status(200).json({ message: "Form received and handled!" });
  } catch (error) {
    console.error("Error handling form data:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;


const express = require("express");
const router = express.Router();
const { getPendingSubmissions, approveSubmission, rejectSubmission } = require("../controllers/approvalController");
const { isSupervisor } = require("../middleware/authMiddleware");

router.get("/submissions/pending", isSupervisor, getPendingSubmissions);
router.post("/submissions/:id/approve", isSupervisor, approveSubmission);
router.post("/submissions/:id/reject", isSupervisor, rejectSubmission);

module.exports = router;
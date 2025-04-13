const express = require("express");
const router = express.Router();
const {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/approvalController");
const { isSupervisor, isCoordinator } = require("../middleware/authMiddleware");
const {
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
} = require("../controllers/approvalController");

router.get("/submissions/pending", isSupervisor, getPendingSubmissions);
router.post("/submissions/:id/approve", isSupervisor, approveSubmission);
router.post("/submissions/:id/reject", isSupervisor, rejectSubmission);
router.get(
  "/coordinator/request/:id",
  isCoordinator,
  getCoordinatorRequestDetails
);
router.post(
  "/coordinator/request/:id/approve",
  isCoordinator,
  coordinatorApproveRequest
);
router.post(
  "/coordinator/request/:id/reject",
  isCoordinator,
  coordinatorRejectRequest
);

module.exports = router;

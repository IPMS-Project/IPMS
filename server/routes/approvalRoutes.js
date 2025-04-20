const express = require("express");
const router = express.Router();

const {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  getStudentSubmissions,
  coordinatorResendRequest,
  deleteStalledSubmission,
  deleteStudentSubmission 
} = require("../controllers/approvalController");

const { isSupervisor, isCoordinator, isStudent } = require("../middleware/authMiddleware");

// ✅ Student API
router.get("/student/submissions", isStudent, getStudentSubmissions);
router.delete("/student/request/:id/delete", isStudent, deleteStudentSubmission);

// ✅ Supervisor APIs
router.get("/submissions/pending", isSupervisor, getPendingSubmissions);
router.post("/submissions/:id/approve", isSupervisor, approveSubmission);
router.post("/submissions/:id/reject", isSupervisor, rejectSubmission);

// ✅ Coordinator APIs
router.get("/coordinator/requests", isCoordinator, getCoordinatorRequests);
router.get("/coordinator/request/:id", isCoordinator, getCoordinatorRequestDetails);
router.post("/coordinator/request/:id/approve", isCoordinator, coordinatorApproveRequest);
router.post("/coordinator/request/:id/reject", isCoordinator, coordinatorRejectRequest);
router.post("/coordinator/request/:id/resend", isCoordinator, coordinatorResendRequest);
router.delete("/coordinator/request/:id/delete", isCoordinator, deleteStalledSubmission);

module.exports = router;

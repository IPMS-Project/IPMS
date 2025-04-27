const express = require("express");
const router = express.Router();
const {
  getStudentSubmissions,
  deleteStudentSubmission,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteStalledSubmission,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  getCoordinatorReports,
  getCoordinatorEvaluations,
  approveJobEvaluation,
  rejectJobEvaluation,
} = require("../controllers/approvalController");

const {
  isSupervisor,
  isCoordinator,
  isStudent,
} = require("../middleware/authMiddleware");

// -----------------------------------------------
// Student Routes
// -----------------------------------------------
router.get("/student/submissions", isStudent, getStudentSubmissions);
router.delete(
  "/student/request/:id/delete",
  isStudent,
  deleteStudentSubmission
);

// -----------------------------------------------
// Supervisor Routes
// -----------------------------------------------
router.get("/submissions/pending", isSupervisor, getPendingSubmissions);
router.post("/submissions/:id/approve", isSupervisor, approveSubmission);
router.post("/submissions/:id/reject", isSupervisor, rejectSubmission);

// -----------------------------------------------
// Coordinator Routes
// -----------------------------------------------
router.get("/coordinator/requests", isCoordinator, getCoordinatorRequests);
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
router.delete(
  "/coordinator/request/:id/delete",
  isCoordinator,
  deleteStalledSubmission
);

router.get("/coordinator/reports", isCoordinator, getCoordinatorReports);
router.get(
  "/coordinator/evaluations",
  isCoordinator,
  getCoordinatorEvaluations
);
router.post(
  "/coordinator/evaluation/:id/approve",
  isCoordinator,
  approveJobEvaluation
);
router.post(
  "/coordinator/evaluation/:id/reject",
  isCoordinator,
  rejectJobEvaluation
);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getSupervisorForms,
  handleSupervisorFormAction,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
} = require("../controllers/approvalController");

const { isSupervisor, isCoordinator } = require("../middleware/authMiddleware");

// =========================================== //
//          Supervisor Approval Routes         //
// =========================================== //

// Supervisor APIs
router.get("/supervisor/forms", isSupervisor, getSupervisorForms);
// Approve route
router.post("/form/:type/:id/approve", isSupervisor, (req, res) =>
    handleSupervisorFormAction(req, res, "approve")
);

// Reject route
router.post("/form/:type/:id/reject", isSupervisor, (req, res) =>
    handleSupervisorFormAction(req, res, "reject")
);

// =========================================== //
//         Coordinator Approval Routes         //
// =========================================== //

// Coordinator APIs
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

module.exports = router;

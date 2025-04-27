const express = require("express");
const router = express.Router();

const {
  getSupervisorForms,
  handleSupervisorFormAction,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  coordinatorApproveManualReview,   // NEW for Sprint 4
  coordinatorRejectManualReview,    // NEW for Sprint 4
} = require("../controllers/approvalController");

const { isSupervisor, isCoordinator } = require("../middleware/authMiddleware");

// =========================================== //
//          Supervisor Approval Routes         //
// =========================================== //

// Supervisor APIs
router.get("/supervisor/forms", isSupervisor, (req, res) => {
    return getSupervisorForms(req, res, {
        supervisor_status: { $in: ["pending"] },
    });
});
router.post("/supervisor/form/:type/:id/approve", isSupervisor, (req, res) =>
    handleSupervisorFormAction(req, res, "approve")
);
router.post("/supervisor/form/:type/:id/reject", isSupervisor, (req, res) =>
    handleSupervisorFormAction(req, res, "reject")
);

// =========================================== //
//         Coordinator Approval Routes         //
// =========================================== //

// Coordinator APIs
router.get("/coordinator/requests", isCoordinator, getCoordinatorRequests);
router.get("/coordinator/request/:id", isCoordinator, getCoordinatorRequestDetails);
router.post("/coordinator/request/:id/approve", isCoordinator, coordinatorApproveRequest);
router.post("/coordinator/request/:id/reject", isCoordinator, coordinatorRejectRequest);

// =========================================== //
//      Coordinator Manual Review A.1 Routes   //
// =========================================== //

router.post("/coordinator/manual-review-a1/:id/approve", isCoordinator, coordinatorApproveManualReview);
router.post("/coordinator/manual-review-a1/:id/reject", isCoordinator, coordinatorRejectManualReview);

module.exports = router;

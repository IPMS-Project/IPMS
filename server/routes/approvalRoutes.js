const express = require("express");
const router = express.Router();
const { isSupervisor, isCoordinator } = require("../middleware/authMiddleware");
const { isSupervisor, isCoordinator, isStudent } = require("../middleware/authMiddleware");
const {
  getSupervisorForms,
  handleSupervisorFormAction,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  getStudentSubmissions,
  getPendingSubmissions,
  coordinatorResendRequest,
  deleteStalledSubmission,
  deleteStudentSubmission,
  rejectSubmission,
  approveSubmission,
} = require("../controllers/approvalController");

// Student API
router.get("/student/submissions", isStudent, getStudentSubmissions);
router.delete("/student/request/:id/delete", isStudent, deleteStudentSubmission);

// Supervisor APIs
router.get("/submissions/pending", isSupervisor, getPendingSubmissions);
router.post("/submissions/:id/approve", isSupervisor, approveSubmission);
router.post("/submissions/:id/reject", isSupervisor, rejectSubmission);


// =========================================== //
//          Supervisor Approval Routes         //
// =========================================== //

// Supervisor APIs
router.get("/supervisor-dashboard", isSupervisor, (req,res)=>{
  res.render("supervisorDashboard");
})
router.get("/supervisor/forms", isSupervisor, (req, res) => {
    // const supervisorId = req.user._id,
    return getSupervisorForms(req, res, {
        // supervisor_id: supervisorId,
        supervisor_status: { $in: ["pending"] },
    })
});
// Approve route
router.post("/supervisor/form/:type/:id/approve", isSupervisor, (req, res) =>
    handleSupervisorFormAction(req, res, "approve")
);

// Reject route
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
router.post("/coordinator/request/:id/resend", isCoordinator, coordinatorResendRequest);
router.delete("/coordinator/request/:id/delete", isCoordinator, deleteStalledSubmission);


module.exports = router;
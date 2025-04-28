const express = require("express");
const router = express.Router();

const {
  getSupervisorForms,
  handleSupervisorFormAction,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  coordinatorApproveRequest,
  coordinatorRejectRequest,
  approveFormA3,
} = require("../controllers/approvalController");

const { isSupervisor, isCoordinator } = require("../middleware/authMiddleware");

// Import InternshipRequest model to manually handle basic form approval
const InternshipRequest = require("../models/InternshipRequest");

// Supervisor APIs
router.get("/supervisor/forms", isSupervisor, (req, res) => {
    return getSupervisorForms(req, res, {
        supervisor_status: { $in: ["pending"] },
    });
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

// NEW Coordinator API: Approve Form A.3
router.post("/coordinator/form-a3/:formId/approve", isCoordinator, approveFormA3);

// NEW SIMPLE Approve Form API (ONLY status update: submitted -> approved)
router.post("/form/:formId/approve", async (req, res) => {  
  const { formId } = req.params;

  try {
    const form = await InternshipRequest.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.status = 'approved';
    form.approvedAt = new Date();  
    await form.save();        

    res.status(200).json({ message: 'Form approved successfully!' });
  } catch (error) {
    console.error('Error approving form:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;

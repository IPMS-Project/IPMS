const InternshipRequest = require("../models/internshiprequest");
const WeeklyReport = require("../models/WeeklyReport");

exports.getA1ByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find A1 form by matching the student's email via the populated 'student' reference
    const form = await InternshipRequest.findOne()
      .populate({
        path: "student",
        match: { email }, // only match where user's email matches
        select: "name email"
      });

    // If student wasn't matched via population or form doesn't exist
    if (!form || !form.student) {
      return res.status(404).json({
        success: false,
        message: "A1 form not found for this email.",
      });
    }

    // Fetch all submitted weekly reports by this student email
    const reports = await WeeklyReport.find({ email });

    // Sum up the completed hours
    const completedHours = reports.reduce((sum, report) => sum + (report.hours || 0), 0);

    // Calculate required hours
    const creditHours = form.creditHours || 0;
    const requiredHours = creditHours * 60;

    res.status(200).json({
      success: true,
      form: {
        name: form.student.name,
        email: form.student.email,
        supervisorName: form.internshipAdvisor?.name || "",
        supervisorEmail: form.internshipAdvisor?.email || "",
        creditHours,
        completedHours,
        requiredHours
      }
    });
  } catch (err) {
    console.error("Error fetching A1 form:", err);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving A1 data.",
    });
  }
};

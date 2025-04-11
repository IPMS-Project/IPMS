// const User = require("../models/User");
// const WeeklyReport = require("../models/WeeklyReport");

// /**
//  * Report Controller – handles weekly report submissions and retrieval
//  */

// // // const reportController = {
// // //   // POST /api/reports
// //   const reportController = {
// //     createReport: async (req, res) => {
// //       try {
// //         const {
// //           studentId,
// //           week,
// //           hours,
// //           tasks,
// //           lessons,
// //           supervisorComments,
// //         } = req.body;
  
// //         const user = await User.findById(studentId);
// //         if (!user || user.role.toLowerCase() !== "student") {
// //           return res.status(403).json({
// //             success: false,
// //             message: "Only students can submit reports.",
// //           });
// //         }
  
// //         if (!week || hours === undefined || !tasks || !lessons) {
// //           return res.status(400).json({
// //             success: false,
// //             message: "Please fill all required fields.",
// //           });
// //         }
  
// //         // const newReport = new WeeklyReport({
// //         //   studentId,
// //         //   week,
// //         //   hours,
// //         //   tasks,
// //         //   lessons,
// //         //   supervisorComments,
// //         // });
// //         const newReport = new WeeklyReport({
// //           studentId,
// //           week,
// //           hours,
// //           tasks,
// //           lessons,
// //           supervisorComments,
// //         });
  
// //         await newReport.save();
  
// //         res.status(201).json({
// //           success: true,
// //           message: "Report submitted successfully.",
// //         });
// //       } catch (error) {
// //         console.error("Error in createReport:", error);
// //         res.status(500).json({
// //           success: false,
// //           message: "Internal server error.",
// //         });
// //       }
// //     },

// const reportController = {
//   createReport: async (req, res) => {
//     try {
//       const {
//         week,
//         hours,
//         tasks,
//         lessons,
//         supervisorComments,
//       } = req.body;

//       // Temporary Static studentId for testing purpose
//       const studentId = "123456";

//       if (!week || hours === undefined || !tasks || !lessons) {
//         return res.status(400).json({
//           success: false,
//           message: "All fields are required.",
//         });
//       }

//       const newReport = new WeeklyReport({
//         studentId,
//         week,
//         hours,
//         tasks,
//         lessons,
//         supervisorComments,
//       });
//       console.log("Payload received in backend:", {
//         studentId,
//         week,
//         hours,
//         tasks,
//         lessons,
//         supervisorComments,
//       });
      
//       await newReport.save();

//       res.status(201).json({
//         success: true,
//         message: "Report submitted successfully.",
//       });

//     } catch (error) {
//       console.error("Error in createReport:", error);
//       res.status(500).json({
//         success: false,
//         message: "Internal server error.",
//       });
//     }
//   },
//   // GET /api/reports/:userId
//   getReportsByStudent: async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const reports = await WeeklyReport.find({ studentId: userId }).sort({
//         createdAt: -1,
//       });

//       res.status(200).json({
//         success: true,
//         reports,
//       });
//     } catch (error) {
//       console.error("Error in getReportsByStudent:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to retrieve reports." });
//     }
//   },
// };

// module.exports = reportController;
const User = require("../models/User");
const WeeklyReport = require("../models/WeeklyReport");

const reportController = {
  createReport: async (req, res) => {
    try {
      const {
        week,
        hours,
        tasks,
        lessons,
        supervisorComments,
      } = req.body;

      const studentId = "123456";  // Static for testing

      if (!week || hours === undefined || !tasks || !lessons) {
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      const newReport = new WeeklyReport({
        studentId,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments,
      });

      console.log("Payload received in backend:", {
        studentId,
        week,
        hours,
        tasks,
        lessons,
        supervisorComments,
      });

      await newReport.save();

      res.status(201).json({
        success: true,
        message: "Report submitted successfully.",
      });

    } catch (error) {
      console.error("Error in createReport:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  getReportsByStudent: async (req, res) => {
    try {
      const { userId } = req.params;

      const reports = await WeeklyReport.find({ studentId: userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        reports,
      });

    } catch (error) {
      console.error("Error in getReportsByStudent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve reports.",
      });
    }
  },
};

module.exports = reportController;

import { createBrowserRouter } from "react-router-dom";

// Pages
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";
import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import ActivateAccount from "./pages/ActivateAccount";
import A4PresentationEvaluationForm from "./pages/A4PresentationEvaluationForm";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CoordinatorRequestDetailView from "./pages/CoordinatorRequestDetailView";
import CumulativeReviewForm from "./pages/CumulativeReviewForm"; // ✅ Group of 4 for Supervisor
import CoordinatorReviewForm from "./pages/CoordinatorReviewForm"; // ✅ Group for Coordinator
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import SubmittedReports from "./pages/SubmittedReports";
import CoordinatorCumulativeReviewForm from "./pages/CoordinatorCumulativeReviewForm";


// Layout
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "signup", element: <SignUp /> },
      { path: "weekly-report", element: <WeeklyProgressReportForm /> },
      { path: "four-week-report", element: <WeeklyFourWeekReportForm /> },
      { path: "a1-form", element: <A1InternshipRequestForm /> },
      { path: "evaluation", element: <A3JobEvaluationForm /> },
      { path: "activate/:token", element: <ActivateAccount /> },
      { path: "presentation", element: <A4PresentationEvaluationForm /> },
      { path: "supervisor-dashboard", element: <SupervisorDashboard /> },
      { path: "coordinator-dashboard", element: <CoordinatorDashboard /> },

      // Coordinator Request Detail
      { path: "coordinator/request/:id", element: <CoordinatorRequestDetailView /> },

      // Weekly review form for a specific week
      {
        path: "weekly-report/:groupIndex/week-:weekNumber/:studentName",
        element: <WeeklyProgressReportForm />,
      },

      //  Submitted Reports List
      { path: "submitted-reports", element: <SubmittedReports /> },

      // View Specific Report - read-only
      { path: "submitted-reports/view/:reportId", element: <WeeklyProgressReportForm readOnly={true} /> },

      //  Redundant but retained for compatibility
      { path: "submitted-reports/view/:id", element: <WeeklyProgressReportForm readOnly={true} /> },

      //  Supervisor's group review form (4 weeks)
      { path: "review-cumulative/:groupIndex", element: <CumulativeReviewForm /> },

      //  Coordinator's review form after supervisor comments
      { path: "coordinator-review/:groupIndex", element: <CoordinatorReviewForm /> },
      {
        path: "review-cumulative/:groupIndex/coordinator",
        element: <CoordinatorCumulativeReviewForm />,
      },
      
    ],
  },
]);

export default router;

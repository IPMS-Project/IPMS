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
import CumulativeReviewForm from "./pages/CumulativeReviewForm"; // 🚀 NEW PAGE
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import SubmittedReports from "./pages/SubmittedReports";

// Layout
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "weekly-report",
        element: <WeeklyProgressReportForm />,
      },
      {
        path: "four-week-report",
        element: <WeeklyFourWeekReportForm />,
      },
      {
        path: "a1-form",
        element: <A1InternshipRequestForm />,
      },
      {
        path: "evaluation",
        element: <A3JobEvaluationForm />,
      },
      {
        path: "activate/:token",
        element: <ActivateAccount />,
      },
      {
        path: "presentation",
        element: <A4PresentationEvaluationForm />,
      },
      {
        path: "supervisor-dashboard",
        element: <SupervisorDashboard />,
      },
      {
        path: "coordinator-dashboard",
        element: <CoordinatorDashboard />,
      },
      {
        path: "coordinator/request/:id",
        element: <CoordinatorRequestDetailView />,
        path: "review-cumulative/:groupIndex",   // 🚀 NEW ROUTE
        element: <CumulativeReviewForm />,
      },
      {
        path: "weekly-report/:groupIndex/week-:weekNumber/:studentName",
        element: <WeeklyProgressReportForm />,  // <- Your Weekly Form Page
      },
      {
        path: "submitted-reports",
        element: <SubmittedReports />,
      },
      {
        path: "submitted-reports/view/:reportId",
        element: <WeeklyProgressReportForm readOnly={true} />,
      },
      {
        path: "submitted-reports/view/:id",
        element: <WeeklyProgressReportForm readOnly={true} />,
      },
      
    ],
  },
]);

export default router;

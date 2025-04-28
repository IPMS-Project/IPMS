import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import ActivateAccount from "./pages/ActivateAccount";
import A4PresentationEvaluationForm from "./pages/A4PresentationEvaluationForm";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CoordinatorRequestDetailView from "./pages/CoordinatorRequestDetailView";
import TokenRenewal from "./pages/TokenRenewal";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRouteStudent from "./pages/ProtectedRouteStudent";
import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";
import SubmittedReports from "./pages/SubmittedReports";
import CumulativeReviewForm from "./pages/CumulativeReviewForm";
import CoordinatorReviewForm from "./pages/CoordinatorReviewForm";
import CoordinatorCumulativeReviewForm from "./pages/CoordinatorCumulativeReviewForm";

// Create and export the router configuration
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
        path: "student-dashboard",
        element: (
          <ProtectedRouteStudent>
            <StudentDashboard />
          </ProtectedRouteStudent>
        ),
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
      },
      {
        path: "renew-token/:token",
        element: <TokenRenewal />,
      },
      {
        path: "four-week-report",
        element: <WeeklyFourWeekReportForm />,
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
        path: "review-cumulative/:groupIndex",
        element: <CumulativeReviewForm />,
      },
      {
        path: "coordinator-review/:groupIndex",
        element: <CoordinatorReviewForm />,
      },
      {
        path: "review-cumulative/:groupIndex/coordinator",
        element: <CoordinatorCumulativeReviewForm />,
      },
      {
        path: "weekly-report/:groupIndex/week-:weekNumber/:studentName",
        element: <Home />,
      },
    ],
  },
]);

export default router;
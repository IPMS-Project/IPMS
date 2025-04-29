import React from "react";
import { createBrowserRouter } from "react-router-dom";
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import ActivateAccount from "./pages/ActivateAccount";
import A4PresentationEvaluationForm from "./pages/A4PresentationEvaluationForm";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CoordinatorRequestDetailView from "./pages/CoordinatorRequestDetailView";
import TokenRenewal from "./pages/TokenRenewal";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRouteStudent from "./pages/ProtectedRouteStudent";
import About from "./pages/About";
import Contact from "./pages/Contact";
import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";
import SubmittedReports from "./pages/SubmittedReports";
import CumulativeReviewForm from "./pages/CumulativeReviewForm";
import CoordinatorReviewForm from "./pages/CoordinatorReviewForm";
import CoordinatorCumulativeReviewForm from "./pages/CoordinatorCumulativeReviewForm";
import ProtectedSupervisor from "./pages/ProtectedSupervisor";

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
        element: (
            <ProtectedSupervisor>
            <SupervisorDashboard />
            </ProtectedSupervisor>
        ),
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
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
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

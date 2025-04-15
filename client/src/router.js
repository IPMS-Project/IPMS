import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";
import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import A4PresentationEvaluationForm from "./pages/A4PresentationEvaluationForm";
import ActivateAccount from "./pages/ActivateAccount";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CumulativeReviewForm from "./pages/CumulativeReviewForm";
import CoordinatorRequestDetailView from "./pages/CoordinatorRequestDetailView";

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
        path: "presentation",
        element: <A4PresentationEvaluationForm />,
      },
      {
        path: "activate/:token",
        element: <ActivateAccount />,
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
        path: "review-cumulative/:groupIndex",
        element: <CumulativeReviewForm />,
      },
      {
        path: "coordinator/request/:id",
        element: <CoordinatorRequestDetailView />,
      },
    ],
  },
]);

export default router;

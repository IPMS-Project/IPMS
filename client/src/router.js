import React from 'react';


import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import ReportForm from "./pages/ReportForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";

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
        path: "weekly-report", // "/weekly-report"
        element: <WeeklyProgressReportForm />,
      },
      {
        path: "report", // New route added for testing backend functionality
        element: <ReportForm />,
      },
      {
        path: "evaluation",
        element: <A3JobEvaluationForm />,
      },
      {
        path: "supervisor-dashboard",
        element: <SupervisorDashboard />,
      },
      {
        path: "coordinator-dashboard",
        element: <CoordinatorDashboard />,
      },
      // Add more routes as needed
    ],
  },
]);

export default router;

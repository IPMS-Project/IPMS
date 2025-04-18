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
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRouteStudent from "./pages/ProtectedRouteStudent";

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
        path: "/student-dashboard",
        element: (
          <ProtectedRouteStudent>
            <StudentDashboard />
          </ProtectedRouteStudent>
        )
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
        path: "supervisor-dashboard",
        element: <SupervisorDashboard />,
      },
      {
        path: "coordinator-dashboard",
        element: <CoordinatorDashboard />,
      },
    ],
  },
]);


export default router;

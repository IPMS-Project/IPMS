import { createBrowserRouter } from "react-router-dom";
// <<<<<<< groupD/vikash-sprint2
// =======
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";

// Layout
import Layout from "./components/Layout";
// >>>>>>> main

// Pages
//import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";
import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";
import WeeklyProgressReportForm from "./pages/WeeklyProgressReportForm";
import A3JobEvaluationForm from "./pages/A3JobEvaluationForm";
import ActivateAccount from "./pages/ActivateAccount";
import A4PresentationEvaluationForm from "./pages/A4PresentationEvaluationForm";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
// <<<<<<< groupD/vikash-sprint2
import CumulativeReviewForm from "./pages/CumulativeReviewForm"; // 🚀 NEW PAGE
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Layout
import Layout from "./components/Layout";
// =======
import CoordinatorRequestDetailView from "./pages/CoordinatorRequestDetailView";
// >>>>>>> main

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
// <<<<<<< groupD/vikash-sprint2
        path: "review-cumulative/:groupIndex",   // 🚀 NEW ROUTE
        element: <CumulativeReviewForm />,
// =======
        path: "coordinator/request/:id",
        element: <CoordinatorRequestDetailView />,
// >>>>>>> main
      },
    ],
  },
]);

export default router;

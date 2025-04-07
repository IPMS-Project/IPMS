import { createBrowserRouter } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import ReportForm from "./pages/ReportForm";
import WeeklyProgressReportForm from "./components/WeeklyProgressReportForm"; // Don't forget this import

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true, // 👈 this should stay Home
        element: <Home />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "weekly-report", // 👈 this should NOT be default
        element: <WeeklyProgressReportForm />,
      },
      {
        path: "report",
        element: <ReportForm />,
      },
    ],
  },
]);

export default router;

import { createBrowserRouter } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import ReportForm from "./pages/ReportForm";

// ✅ Weekly Progress Report component
import WeeklyProgressReportForm from "./components/WeeklyProgressReportForm";

// Create and export the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true, // ✅ this becomes the default route
        element: <WeeklyProgressReportForm />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "weekly-report", // optional: allows visiting this via direct link
        element: <WeeklyProgressReportForm />,
      },
      {
        path: "report", // backend testing route
        element: <ReportForm />,
      },
      {
        path: "home", // optional: still keep home if needed
        element: <Home />,
      },
    ],
  },
]);

export default router;

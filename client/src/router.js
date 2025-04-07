import { createBrowserRouter } from "react-router-dom";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import SignIn from "./pages/SignIn";

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
        path: "signin",
        element: <SignIn />,
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

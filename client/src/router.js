import { createBrowserRouter } from "react-router-dom";
import A1InternshipRequestForm from "./pages/A1InternshipRequestForm";


// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

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
        path: "a1-form",
        element: <A1InternshipRequestForm />,
      },      
      // Add more routes as needed
    ],
  },
]);

export default router;

import React from 'react';
import { RouterProvider } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
//import WeeklyFourWeekReportForm from "./pages/WeeklyFourWeekReportForm";


import router from "./router";
import "./styles/App.css";

function App() {
  return <RouterProvider router={router} />;
}

export default App;




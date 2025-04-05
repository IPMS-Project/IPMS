import WeeklyProgressReportForm from "./components/WeeklyProgressReportForm";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./styles/App.css";
import React from 'react';
import './App.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;

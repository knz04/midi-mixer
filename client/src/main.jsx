import * as React from "react";
import * as ReactDOM from "react-dom/client";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
// import Record from "./components/Record";
// import RecordList from "./components/RecordList";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "/",
//         element: <RecordList />,
//       },
//     ],
//   },
//   {
//     path: "/edit/:id",
//     element: <App />,
//     children: [
//       {
//         path: "/edit/:id",
//         element: <Record />,
//       },
//     ],
//   },
//   {
//     path: "/create",
//     element: <App />,
//     children: [
//       {
//         path: "/create",
//         element: <Record />,
//       },
//     ],
//   },
// ]);

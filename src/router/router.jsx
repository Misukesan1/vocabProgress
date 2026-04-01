import { createBrowserRouter } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Fiches from "../pages/Fiches";
import Progress from "../pages/Progress";
import Settings from "../pages/Settings";
import FicheDetails from "../pages/FicheDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/fiches",
        element: <Fiches />,
      },
      {
        path: "/fiche/:id",
        element: <FicheDetails />,
      },
      {
        path: "/progres",
        element: <Progress />,
      },
      {
        path: "/options",
        element: <Settings />,
      },
    ],
  },
]);

export default router;

import { createHashRouter } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Fiches from "../pages/Fiches";
import Settings from "../pages/Settings";
import FicheDetails from "../pages/FicheDetails";
import Training from "../pages/Training";
import TrainingQuiz from "../pages/TrainingQuiz";
import Entrainement from "../pages/Entrainement";
import Onboarding from "../pages/Onboarding";
import OnboardingEnd from "../pages/OnboardingEnd";
import Help from "../pages/Help";

const router = createHashRouter([
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
        path: "/fiche/:id/training",
        element: <Training />
      },
      {
        path: "/fiche/:id/qcm",
        element: <TrainingQuiz />
      },
      {
        path: "/premiers-pas",
        element: <Onboarding />,
      },
      {
        path: "/premiers-pas/fin",
        element: <OnboardingEnd />,
      },
      {
        path: "/entrainement",
        element: <Entrainement />,
      },
      {
        path: "/aide",
        element: <Help />,
      },
      {
        path: "/options",
        element: <Settings />,
      },
    ],
  },
]);

export default router;

import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";

import router from "./router/router.jsx";
import store from "./store.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </HeroUIProvider>,
);

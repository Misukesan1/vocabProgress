import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";

import router from "./router/router.jsx";
import store from "./store.js";
import "./index.css";

// Mode dev uniquement : données de test lançables depuis la console (seedKanji())
if (import.meta.env.DEV) {
  import("./tests/seedKanji.js").then(({ seedKanji }) => {
    window.seedKanji = seedKanji;
  });
}

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <NextThemesProvider attribute="class" defaultTheme="light">
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </NextThemesProvider>
  </HeroUIProvider>,
);

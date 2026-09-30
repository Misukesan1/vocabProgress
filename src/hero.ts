import { heroui } from "@heroui/react";

// Accent "encre terracotta" — identité signature de l'app, à la place du
// bleu/violet par défaut de HeroUI.
export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          50: "#fdf3ee",
          100: "#fbe1d2",
          200: "#f4c19f",
          300: "#eca06b",
          400: "#d97f45",
          500: "#c1652f",
          600: "#a14f22",
          700: "#7e3d1b",
          800: "#602f16",
          900: "#482310",
          DEFAULT: "#c1652f",
          foreground: "#fdf3ee",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          50: "#482310",
          100: "#602f16",
          200: "#7e3d1b",
          300: "#a14f22",
          400: "#c1652f",
          500: "#d97f45",
          600: "#eca06b",
          700: "#f4c19f",
          800: "#fbe1d2",
          900: "#fdf3ee",
          DEFAULT: "#e2915a",
          foreground: "#201b17",
        },
      },
    },
  },
});
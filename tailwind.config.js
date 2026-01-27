/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./views/**/*.ejs", "./views/*.ejs", "./public/scripts/*.js"],
  theme: {
    extend: {
      colors: {
        itp: {
          red: "#FF0033",
          dark: "#0f0f0f",
          light: "#ffffff",
          gray: {
            50: "#f9f9f9",
            100: "#f1f1f1",
            200: "#e5e5e5",
            300: "#aaaaaa",
            400: "#717171",
            500: "#606060",
            600: "#3d3d3d",
            700: "#272727",
            800: "#1a1a1a",
            900: "#0f0f0f",
          },
        },
      },
    },
  },
  darkMode: "class",

  plugins: [require("@tailwindcss/typography")],
};

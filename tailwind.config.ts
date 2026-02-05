import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: [
    "./components/**/*.{html,js,ts,jsx,tsx,vue,svelte}",
    "./app/**/*.{html,js,ts,jsx,tsx,vue,svelte}",
  ],
  darkMode: "class", // or 'media'
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#13ecda",
        "background-light": "#f6f8f8",
        "background-dark": "#102220",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Lexend", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Lexend", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Roboto Mono",
          "monospace",
        ],
      },
      boxShadow: {
        xlsoft: "0 10px 30px rgba(2,6,23,0.15)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 240ms cubic-bezier(.16,.84,.44,1)",
      },
    },
  },
  plugins: [forms, typography, aspectRatio, lineClamp],
};

export default config;

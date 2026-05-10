import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Geist", "Satoshi", "IBM Plex Sans", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: "#080a0f",
        panel: "#10141d",
        panel2: "#151b26",
        line: "#273142",
        cyan: "#4ad7ff",
        blue: "#5f8cff",
        amber: "#f2b84b",
        violet: "#a58bff",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(74, 215, 255, .16), 0 24px 80px rgba(0, 0, 0, .35)",
      },
    },
  },
  plugins: [],
} satisfies Config;

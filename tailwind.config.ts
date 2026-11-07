import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          surface: "#F3EFE6",
          card: "#FAF7F2",
          recessed: "#E8E2D5",
          border: "#DED6C6",
          shadow: "#D5CCB9",
        },
        ink: {
          primary: "#1C1917",
          muted: "#655E54",
          faint: "#9C9488",
        },
        terracotta: {
          DEFAULT: "#C84B31",
          dark: "#8F2D19",
          light: "#DF654B",
        },
        pigment: {
          cerulean: "#0077B6",
          ochre: "#D9822B",
          sage: "#2E7D5B",
          aubergine: "#6D4C7D",
          crimson: "#B8332A",
        },
        att: {
          blue: "#0077B6",
          cerulean: "#0077B6",
          dark: "#0C2340",
          light: "#E8F4FC",
          accent: "#00A9E0",
          orange: "#D9822B",
        },
      },
      boxShadow: {
        cutout: "4px 5px 0px #D5CCB9, 0 10px 20px rgba(45, 38, 30, 0.08)",
        "cutout-lg": "6px 8px 0px #D5CCB9, 0 15px 30px rgba(45, 38, 30, 0.12)",
        "cutout-sm": "2px 3px 0px #D5CCB9, 0 4px 8px rgba(45, 38, 30, 0.05)",
        pressed: "inset 2px 2px 5px rgba(45, 38, 30, 0.12), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
        stamp: "0 3px 0 #8F2D19, 0 6px 12px rgba(143, 45, 25, 0.25)",
        "stamp-pressed": "0 1px 0 #8F2D19, 0 2px 4px rgba(143, 45, 25, 0.2)",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

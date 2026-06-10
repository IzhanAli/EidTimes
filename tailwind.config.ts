import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#171514",
          muted: "#5b5b58",
          subtle: "#8a8a85",
        },
        paper: {
          DEFAULT: "#f6f1e6",
          card: "#fdfaf2",
          line: "#e3dcc8",
        },
        emerald: {
          DEFAULT: "#0f5132",
          deep: "#0a3d26",
          soft: "#d6e6da",
        },
        saffron: {
          DEFAULT: "#c97a3e",
          deep: "#a85d24",
          soft: "#f5e3cf",
        },
        plum: {
          DEFAULT: "#6b1f2a",
          soft: "#ecd5d8",
        },
        gold: {
          DEFAULT: "#a47e2a",
          soft: "#efe4bf",
        },
        sky: {
          deep: "#1f3d5c",
          soft: "#d6e1ec",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto"],
        serif: ["'Source Serif 4'", "'Source Serif Pro'", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
};

export default config;

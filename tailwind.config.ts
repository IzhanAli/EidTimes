import type { Config } from "tailwindcss";

/**
 * Colour tokens are CSS-variable-driven so the palette swaps with the active
 * occasion (see :root / [data-occasion] blocks in globals.css):
 *   - `emerald` is the primary accent — emerald for Eid al-Fitr, terracotta
 *     for Eid al-Adha (the token name is historical; treat it as "accent").
 *   - `saffron` is the secondary accent — gold for Fitr, burnt amber for Adha.
 *   - `paper` shifts from cool ivory (Fitr) to warm sand (Adha).
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

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
          DEFAULT: v("--paper"),
          card: v("--paper-card"),
          line: v("--paper-line"),
        },
        emerald: {
          DEFAULT: v("--accent"),
          deep: v("--accent-deep"),
          soft: v("--accent-soft"),
        },
        saffron: {
          DEFAULT: v("--accent2"),
          deep: v("--accent2-deep"),
          soft: v("--accent2-soft"),
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
        sans: ["'Hanken Grotesk'", "'Avenir Next'", "Seravek", "ui-sans-serif"],
        serif: ["Fraunces", "'Iowan Old Style'", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 360ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

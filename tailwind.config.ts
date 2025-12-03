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
        background: "#F9F5F0",
        surface: "#F5F0EA",
        "surface-2": "#F0EBE5",
        "surface-3": "#EBE6E0",
        "text-primary": "#2C2C2C",
        "text-secondary": "#6B6B6B",
        border: "#E6E1DB",
        accent: "#000000",
        "user-message": "#F0EBE5",
        "assistant-message": "#F9F5F0",
        "highlight": "#FFF4E6",
        "highlight-border": "#FFE0B2",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Charter",
          "Bitstream Charter",
          "Sitka Text",
          "Cambria",
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

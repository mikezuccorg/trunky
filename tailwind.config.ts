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
        background: "#FFFFFF",
        surface: "#FAFAFA",
        "surface-2": "#F5F5F5",
        "surface-3": "#EEEEEE",
        "text-primary": "#2C2C2C",
        "text-secondary": "#6B6B6B",
        border: "#E5E5E5",
        accent: "#000000",
        "user-message": "#F0F0F0",
        "assistant-message": "#FFFFFF",
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

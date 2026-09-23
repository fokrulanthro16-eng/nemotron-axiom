import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        nvidia: {
          DEFAULT: "#76b900",
          glow: "#8be100",
          dim: "#4e7b00",
        },
        axiom: {
          dark: "#08090d",
          card: "#0f1117",
          border: "#1e2230",
          borderActive: "#3b82f6",
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Cascadia Code",
          "Consolas",
          "monospace",
        ],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-nvidia": "glowNvidia 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowNvidia: {
          "0%": { boxShadow: "0 0 5px rgba(118, 185, 0, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(118, 185, 0, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

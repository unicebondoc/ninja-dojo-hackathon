import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        blood: "#DC2626",
        ink: "#050506",
        soot: "#101014",
        moon: "#F6E7B1",
        gold: "#C9A84E"
      },
      boxShadow: {
        shoji: "0 0 0 1px rgba(246,231,177,0.12), 0 24px 90px rgba(0,0,0,0.55)",
        blood: "0 0 28px rgba(220,38,38,0.45)"
      }
    }
  },
  plugins: []
};

export default config;

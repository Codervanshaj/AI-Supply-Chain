import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 30%), radial-gradient(circle at 80% 10%, rgba(14,116,144,0.14), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef6ff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;


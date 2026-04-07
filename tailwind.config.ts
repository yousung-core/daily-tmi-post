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
        // Daily Prophet 빈티지 색상 팔레트
        parchment: {
          50: "#fdfcf9",
          100: "#f9f5eb",
          200: "#f3ead6",
          300: "#e8d9b8",
          400: "#d9c292",
          500: "#c9a96c",
          600: "#b8925a",
          700: "#9a754a",
          800: "#7d5f41",
          900: "#664d37",
        },
        ink: {
          50: "#f6f5f4",
          100: "#e7e5e3",
          200: "#d1ccc7",
          300: "#b5ada5",
          400: "#7a6f64",
          500: "#5a5048",
          600: "#635a51",
          700: "#514a43",
          800: "#3d3833",  // 메인 텍스트
          900: "#2a2622",
        },
        accent: {
          gold: "#b8860b",
          crimson: "#8b0000",
          forest: "#228b22",
        },
      },
      fontFamily: {
        headline: ["Playfair Display", "Georgia", "serif"],
        body: ["Lora", "Georgia", "serif"],
        accent: ["UnifrakturMaguntia", "Georgia", "serif"],
      },
      backgroundImage: {
        "paper-texture": "url('/images/paper-texture.png')",
      },
    },
  },
  plugins: [],
};

export default config;

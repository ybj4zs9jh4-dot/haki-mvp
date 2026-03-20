import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette Haki
        haki: {
          indigo:    "#1A237E",
          "indigo-lt": "#E8EAF6",
          "indigo-md": "#C5CAE9",
          "indigo-3": "#3949AB",
          safran:    "#FFC107",
          "safran-lt": "#FFFDE7",
          teal:      "#00695C",
          "teal-lt": "#E0F2F1",
          orange:    "#E65100",
          "orange-lt": "#FFF3E0",
          green:     "#2E7D32",
          "green-lt": "#E8F5E9",
          red:       "#B71C1C",
          "red-lt":  "#FFEBEE",
          dark:      "#0D0D2B",
        },
        // Alias sémantiques dimensions
        dim1: "#1A237E",
        dim2: "#00695C",
        dim3: "#E65100",
        dim4: "#2E7D32",
        socle: "#B71C1C",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Calibri", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

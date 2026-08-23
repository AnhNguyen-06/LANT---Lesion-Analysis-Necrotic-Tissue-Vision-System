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
        oceanic: {
          DEFAULT: "#002B8C",
          50: "#EEF4FF",
          100: "#D9E5FD",
          200: "#B8D0FB",
          300: "#86B0F7",
          400: "#4D8AF2",
          500: "#2563EB",
          600: "#1347CE",
          700: "#002B8C",
          800: "#082870",
          900: "#0C235A",
          950: "#08163B",
        },
        dusk: {
          DEFAULT: "#3E5D8E",
          50: "#F4F6F9",
          100: "#E6ECF3",
          200: "#CDD8E6",
          300: "#A5BAD2",
          400: "#7598BC",
          500: "#537BA6",
          600: "#3E5D8E",
          700: "#344B74",
          800: "#2D3E5F",
          900: "#293650",
          950: "#1A2234",
        },
        sapphire: {
          DEFAULT: "#0F52BA",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#0F52BA",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        azure: {
          DEFAULT: "#F0FFFF",
          mist: "#F0FFFF",
          50: "#F0FFFF",
          100: "#E0F7FA",
          200: "#B2EBF2",
          300: "#80DEEA",
        },
        indigoContrast: {
          DEFAULT: "#282888",
          800: "#282888",
          900: "#1D1D63",
          950: "#121240",
        },
        medical: {
          granulation: "#DC2626",
          slough: "#F59E0B",
          necrotic: "#111827",
          epithelial: "#EC4899",
          safe: "#10B981",
        }
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        heading: ["var(--font-montserrat)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'clinical': '0 4px 20px -2px rgba(0, 43, 140, 0.08), 0 2px 6px -1px rgba(0, 43, 140, 0.04)',
        'clinical-lg': '0 10px 30px -4px rgba(0, 43, 140, 0.12), 0 4px 12px -2px rgba(0, 43, 140, 0.06)',
        'glow-sapphire': '0 0 20px rgba(15, 82, 186, 0.25)',
        'hazard': '0 0 25px rgba(220, 38, 38, 0.3)',
      }
    },
  },
  plugins: [],
};
export default config;

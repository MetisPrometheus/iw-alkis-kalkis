import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-fg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        gold: "var(--gold)",
        "tint-ol": "var(--tint-ol)",
        "tint-vin": "var(--tint-vin)",
        "tint-brennevin": "var(--tint-brennevin)",
        "tint-sider": "var(--tint-sider)",
        "tint-annet": "var(--tint-annet)",
        "tone-ol": "var(--tone-ol)",
        "tone-vin": "var(--tone-vin)",
        "tone-brennevin": "var(--tone-brennevin)",
        "tone-sider": "var(--tone-sider)",
        "tone-annet": "var(--tone-annet)",
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-instrument-sans)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(22 21 19 / 0.05), 0 4px 12px rgb(22 21 19 / 0.05)",
        "card-lg":
          "0 2px 4px rgb(22 21 19 / 0.05), 0 8px 24px rgb(22 21 19 / 0.08), 0 16px 48px rgb(22 21 19 / 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

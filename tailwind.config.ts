import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        flo: {
          bg: {
            base: "var(--color-bg-base)",
            raised: "var(--color-bg-raised)",
            inverted: "var(--color-bg-inverted)"
          },
          accent: {
            orange: "var(--color-accent-orange)"
          },
          text: {
            primary: "var(--color-text-primary)",
            secondary: "var(--color-text-secondary)"
          },
          error: "var(--color-error)",
          border: "var(--border-subtle)"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      borderRadius: {
        card: "var(--radius-card)"
      },
      boxShadow: {
        card: "var(--shadow-card)"
      }
    }
  },
  plugins: []
} satisfies Config;

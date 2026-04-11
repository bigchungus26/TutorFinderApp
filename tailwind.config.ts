import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    // ── Override container to cap at 440px (phone-first) ──────────
    container: {
      center: true,
      padding: "1.25rem",
      screens: { DEFAULT: "440px" },
    },
    extend: {
      // ── Font families ─────────────────────────────────────────────
      fontFamily: {
        display: ["Fraunces", "serif"],
        body:    ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans:    ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },

      // ── Colors — all pull from CSS custom properties ───────────────
      colors: {
        // Background levels
        background:      "var(--bg-primary)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          raised:  "var(--bg-surface-raised)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT:    "var(--bg-muted)",
          foreground: "var(--text-secondary)",
        },

        // Text
        foreground: "var(--text-primary)",
        ink: {
          DEFAULT: "var(--text-primary)",
          muted:   "var(--text-secondary)",
          subtle:  "var(--text-tertiary)",
        },
        "muted-ink": "var(--text-secondary)",

        // Accent
        accent: {
          DEFAULT:    "var(--accent)",
          hover:      "var(--accent-hover)",
          light:      "var(--accent-light)",
          soft:       "var(--accent-light)",
          foreground: "#FFFFFF",
        },

        // Semantic
        success: {
          DEFAULT:    "var(--success)",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT:    "var(--warning)",
          foreground: "#1C1A17",
        },
        error: {
          DEFAULT:    "var(--error)",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT:    "var(--info)",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT:    "var(--error)",
          foreground: "#FFFFFF",
        },

        // Borders
        border:  "var(--border)",
        hairline: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        input:   "var(--border)",
        ring:    "var(--ring)",

        // University tints
        "uni-aub": "var(--uni-aub)",
        "uni-lau": "var(--uni-lau)",
        "uni-ndu": "var(--uni-ndu)",

        // shadcn compat
        primary: {
          DEFAULT:    "var(--accent)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT:    "var(--bg-muted)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT:    "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT:    "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        sidebar: {
          DEFAULT:              "var(--bg-surface)",
          foreground:           "var(--text-primary)",
          primary:              "var(--accent)",
          "primary-foreground": "#FFFFFF",
          accent:               "var(--accent-light)",
          "accent-foreground":  "var(--text-primary)",
          border:               "var(--border)",
          ring:                 "var(--ring)",
        },
      },

      // ── Border radius ──────────────────────────────────────────────
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        DEFAULT: "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl":"var(--radius-2xl)",
        pill: "var(--radius-full)",
        full: "var(--radius-full)",
      },

      // ── Box shadows ────────────────────────────────────────────────
      boxShadow: {
        xs:    "var(--shadow-xs)",
        sm:    "var(--shadow-sm)",
        md:    "var(--shadow-md)",
        lg:    "var(--shadow-lg)",
        xl:    "var(--shadow-xl)",
        float: "var(--shadow-float)",
        none:  "none",
        // legacy
        press: "inset 0 1px 2px rgba(20,20,20,0.12)",
      },

      // ── Animation ─────────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        shimmer:          "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

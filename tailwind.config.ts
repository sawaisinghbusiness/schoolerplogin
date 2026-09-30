import type { Config } from "tailwindcss";

/**
 * SchoolDesk design system.
 *
 * The app's pages use Tailwind's `slate` and `emerald` scales thousands of
 * times, so those two scales are redefined here instead of rewriting every page:
 *  - slate   -> "Ink": a cool neutral with a slight indigo bias (authority, calm)
 *  - emerald -> "Jade": the brand green (growth/learning, and still reads as
 *               "success" wherever pages use it for Present/Paid states)
 * `brand` aliases Jade for new code; `marigold` is a warm accent used sparingly.
 */

const ink = {
  50: "#F7F8FB",
  100: "#EFF1F6",
  200: "#E2E6EF",
  300: "#CBD2DF",
  400: "#97A1B6",
  500: "#687389",
  600: "#4C566B",
  700: "#394153",
  800: "#252C3B",
  900: "#161B27",
  950: "#0C1019",
};

const jade = {
  50: "#ECFDF7",
  100: "#D1FAEC",
  200: "#A6F2DA",
  300: "#6DE4C3",
  400: "#34CDA6",
  500: "#12B28C",
  600: "#089173",
  700: "#07745E",
  800: "#0A5C4C",
  900: "#0B4C40",
  950: "#042B25",
};

const marigold = {
  50: "#FFF9EB",
  100: "#FEEFC7",
  200: "#FDDD8A",
  300: "#FCC74D",
  400: "#FAB124",
  500: "#F2A516",
  600: "#D67C07",
  700: "#B1580A",
  800: "#90440F",
  900: "#763910",
  950: "#441C04",
};

// Brand: royal indigo. Primary actions, active navigation, links and focus.
// (emerald stays green and means paid / present / success.)
const indigo = {
  50: "#EEF0FF",
  100: "#E0E4FF",
  200: "#C7CDFE",
  300: "#A3ACFB",
  400: "#7C87F4",
  500: "#5A66E8",
  600: "#3446D1",
  700: "#2B38AE",
  800: "#252F8C",
  900: "#232B6F",
  950: "#161A43",
};

// "Kajal": the near-black of the sidebar and other dark surfaces.
const night = {
  50: "#F4F5F7",
  100: "#E4E6EB",
  200: "#C9CCD5",
  300: "#A9ADBA",
  400: "#858A99",
  500: "#62677A",
  600: "#454957",
  700: "#2E313B",
  800: "#22242C",
  850: "#1B1D23",
  900: "#141519",
  950: "#0D0E11",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: ink,
        emerald: jade,
        ink,
        brand: indigo,
        marigold,
        night,
        // App background behind the white cards: tinted, so screens are never all-white.
        canvas: "#ECEEF3",
        // shadcn-style semantic tokens backed by the CSS variables in globals.css
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        schoollog: {
          teal: "#12B28C",
          emerald: "#089173",
          coral: "#E5484D",
          amber: "#F2A516",
          mauve: "#D6409F",
          skyblue: "#0EA5E9",
          tealcyan: "#12B28C",
          slate: "#394153",
          purple: "#7C66DC",
          darkheader: "#161B27",
          sidebar: "#FFFFFF",
          subtlebg: "#F7F8FB",
          border: "#E2E6EF",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Nudge the smallest step up: the app leans on text-xs everywhere and 12px read cramped.
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "2xs": "0 1px 1px rgb(12 16 25 / 0.04)",
        xs: "0 1px 2px rgb(12 16 25 / 0.05), 0 1px 1px rgb(12 16 25 / 0.03)",
        sm: "0 1px 3px rgb(12 16 25 / 0.07), 0 1px 2px rgb(12 16 25 / 0.04)",
        md: "0 4px 10px -2px rgb(12 16 25 / 0.08), 0 2px 4px -2px rgb(12 16 25 / 0.05)",
        lg: "0 12px 24px -6px rgb(12 16 25 / 0.10), 0 4px 8px -4px rgb(12 16 25 / 0.06)",
        xl: "0 20px 40px -12px rgb(12 16 25 / 0.16), 0 8px 16px -8px rgb(12 16 25 / 0.08)",
        "2xl": "0 32px 64px -16px rgb(12 16 25 / 0.24)",
        // Cards: hairline border (from the class) + a soft, low shadow. Depth without glow.
        card: "0 1px 2px rgb(21 24 58 / 0.04), 0 10px 26px -16px rgb(21 24 58 / 0.14)",
        "card-hover": "0 1px 2px rgb(21 24 58 / 0.05), 0 16px 34px -18px rgb(21 24 58 / 0.22)",
        // Glows are retired; kept as a no-op so old class names still compile.
        glow: "0 0 #0000",
        "inner-ring": "inset 0 0 0 1px rgb(255 255 255 / 0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        scaleUp: {
          from: { opacity: "0", transform: "scale(0.985)" },
          to: { opacity: "1", transform: "none" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "none" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        grow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        "border-beam": {
          "100%": { offsetDistance: "100%" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out both",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        scaleUp: "scaleUp 0.15s ease-out both",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s infinite",
        "slide-in-right": "slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "none",
        grow: "grow 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        shake: "shake 0.4s ease-in-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;

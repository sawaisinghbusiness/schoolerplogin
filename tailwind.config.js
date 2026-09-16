/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        schoollog: {
          teal: "#28d4a4",
          emerald: "#2ecc71",
          coral: "#e74c3c",
          amber: "#f1c40f",
          mauve: "#e84393",
          skyblue: "#3498db",
          tealcyan: "#1abc9c",
          slate: "#34495e",
          purple: "#9b59b6",
          darkheader: "#1f2937",
          sidebar: "#ffffff",
          subtlebg: "#f4f6f9",
          border: "#e5e7eb"
        }
      }
    },
  },
  plugins: [],
};

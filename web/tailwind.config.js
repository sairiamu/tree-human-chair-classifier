/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        hub: {
          850: "#172033",
          900: "#0f172a",
          950: "#020617",
        }
      },
      boxShadow: {
        'clay-sm': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'clay-md': 'inset 0 4px 6px 0 rgba(255, 255, 255, 0.05), inset 0 -4px 6px 0 rgba(0, 0, 0, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        'clay-lg': 'inset 0 8px 12px 0 rgba(255, 255, 255, 0.05), inset 0 -8px 12px 0 rgba(0, 0, 0, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        'skeuo-press': 'inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
};

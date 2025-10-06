/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: "#466EE5",
        secondary: "#F3F4F6",
        background: "#F9FAFB",
        card: "#FFFFFF",
        text: {
          primary: "#111827",
          secondary: "#374151",
        },
        error: "#EF4444",
      },
    },
  },
  plugins: [],
}
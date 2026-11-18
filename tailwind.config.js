/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        accent: "var(--accent-gold)",
      },
       fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        // This maps 'font-serif' or 'font-playfair' to your Next.js font
        serif: ["var(--font-playfair)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
}

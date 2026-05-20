/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
       fontFamily: {
        // This maps 'font-serif' or 'font-playfair' to your Next.js font
        serif: ["var(--font-playfair)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
}

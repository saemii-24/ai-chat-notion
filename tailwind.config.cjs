/**
 * Minimal Tailwind v4 config for Next.js app-router
 * - Use class-based dark mode so toggling the `dark` class on <html> works
 * - Include the common Next.js/app/component paths so Tailwind scans them
 */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

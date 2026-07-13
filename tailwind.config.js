/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1117',
        surface: '#1E212B',
        primary: '#3B82F6',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#2D3748',
      }
    },
  },
  plugins: [],
}

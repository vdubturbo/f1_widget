/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'f1-bg-primary': '#0f0f0f',
        'f1-bg-secondary': '#1a1a1a',
        'f1-bg-tertiary': '#252525',
        'f1-text-primary': '#ffffff',
        'f1-text-secondary': '#a0a0a0',
        'f1-text-muted': '#666666',
        'f1-accent-red': '#e10600',
        'f1-border': '#333333',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}

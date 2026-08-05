/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        clay: 'var(--clay)',
        paper: 'var(--paper)',
        marigold: 'var(--marigold)',
        'marigold-dark': 'var(--marigold-dark)',
        brick: 'var(--brick)',
        pine: 'var(--pine)',
        'pine-light': 'var(--pine-light)',
        brand: {
          cyan: '#0D9488', // Sagarmatha Cyan
          crimson: '#E11D48', // Crimson Rhododendron
          slate: '#1E293B', // Deep Slate
          gold: '#D49D55', // Sahavas Gold/Ochre
          cream: '#FAF8F5', // Sahavas Off-white/Cream
          dark: '#1E1E1E', // Sahavas Deep Charcoal
          greenbg: '#E6F4EA', // Light Green Badge
          greentxt: '#137333' // Dark Green Badge Text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}

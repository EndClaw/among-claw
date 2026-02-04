import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark gaming theme (Star Atlas inspired)
        background: '#0a0a0f',
        surface: '#12121a',
        surfaceLight: '#1a1a24',
        border: '#2a2a35',

        // Among Us-inspired accent colors
        red: '#e74c3c',
        blue: '#3498db',
        green: '#2ecc71',
        orange: '#e67e22',
        purple: '#9b59b6',
        cyan: '#1abc9c',

        // Subtle gradients (Katana inspired)
        gradientStart: '#1a1a24',
        gradientEnd: '#2a2a35',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
      },
      fontSize: {
        '7xl': '4.5rem',
        '8xl': '6rem',
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
export default config

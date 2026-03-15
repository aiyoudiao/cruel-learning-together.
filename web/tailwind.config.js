export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        solana: {
          primary: '#9945FF',
          secondary: '#14F195',
          dark: '#0B0B0F',
          surface: '#1A1A1F', // slightly lighter for cards
        },
        cyberpunk: {
          neon: '#00F0FF',
          pink: '#FF003C',
          yellow: '#FTEE0E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 10px #9945FF, 0 0 20px #9945FF',
        'neon-green': '0 0 10px #14F195, 0 0 20px #14F195',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #9945FF' },
          '100%': { boxShadow: '0 0 20px #9945FF, 0 0 10px #14F195' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`${__dirname}/src/lib/**/*.{html,tsx}`],
  theme: {
    extend: {
      animation: {
        slideIn: 'slideIn 1s ease-in forwards',
        fadein: 'fadeIn 2s ease 1s 1 normal forwards',
      },
      keyframes: {
        slideIn: {
          '0%': {
            opacity: 0,
            transform: 'translateY(60px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
}

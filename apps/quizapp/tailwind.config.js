const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind')
module.exports = {
  content: [
    `${__dirname}/pages/**/*.{html,tsx}`,
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      animation: {
        slideIn: 'slideIn 1s ease-in forwards',
        fadein: 'fadeIn 2s ease 1s 1 normal forwards',
        fadeout: 'fadeOut 2s ease 0s 1 normal forwards',
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
        fadeOut: {
          // '0%': {
          //   opacity: 1,
          // },
          '100%': {
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [],
}

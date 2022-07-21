const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind')
module.exports = {
  content: [
    `${__dirname}/pages/**/*.{html,tsx}`,
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

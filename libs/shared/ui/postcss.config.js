console.log(__dirname)

module.exports = {
  plugins: {
    tailwindcss: {
      config: `${__dirname}/tailwind.config.js`,
    },
    autoprefixer: {},
  },
}

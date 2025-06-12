module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.html"],
  theme: {
    extend: {
      animation: {
        gradient: "gradientBG 8s ease infinite",
      },
      keyframes: {
        gradientBG: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

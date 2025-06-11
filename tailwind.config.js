/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{ejs,html,js}", // adjust if your templates are elsewhere
    "./public/**/*.{js,css,html}",
    "./src/**/*.{js,jsx,ts,tsx}", // add this if you use a src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

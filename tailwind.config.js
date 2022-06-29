module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  },
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};

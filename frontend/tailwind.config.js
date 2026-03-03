// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))", // Ini akan mengambil variabel dari globals.css
        // ...
      },
    },
  },
}
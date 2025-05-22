/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          boogaloo: ['Boogaloo', 'cursive'],
          dmserif: ['DM Serif Text', 'serif'],
          martian: ['Martian Mono', 'monospace'],
          nabla: ['Nabla', 'cursive'],
          pixelify: ['Pixelify Sans', 'sans-serif'],
          poppins: ['Poppins', 'sans-serif'],
          quicksand: ['Quicksand', 'sans-serif'],
          urbanist: ['Urbanist', 'sans-serif'],
          vt323: ['VT323', 'monospace'],
          worksans: ['Work Sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
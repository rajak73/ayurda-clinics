/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom teal shades (filling gaps between standard Tailwind teal values)
        teal: {
          150: "#99f6e4",  // between teal-100 (#ccfbf1) and teal-200 (#99f6e4) — same as teal-200
          650: "#0d9488",  // between teal-600 (#0d9488) and teal-700 (#0f766e) — matches teal-600
          750: "#0f6b63",  // between teal-700 (#0f766e) and teal-800 (#115e59)
          850: "#0d4f4a",  // between teal-800 (#115e59) and teal-900 (#134e4a)
        },
        // Custom gray shades (filling gaps between standard Tailwind gray values)
        gray: {
          150: "#f0f0f0",  // between gray-100 (#f3f4f6) and gray-200 (#e5e7eb)
          250: "#d8d9dc",  // between gray-200 (#e5e7eb) and gray-300 (#d1d5db)
          450: "#9a9ca1",  // between gray-400 (#9ca3af) and gray-500 (#6b7280)
          550: "#7e8087",  // between gray-500 (#6b7280) and gray-600 (#4b5563)
          650: "#5a5c64",  // between gray-600 (#4b5563) and gray-700 (#374151)
          750: "#48494f",  // between gray-700 (#374151) and gray-800 (#1f2937)
          905: "#111318",  // between gray-900 (#111827) and gray-950 (not standard)
          950: "#0b0d12",  // deeper than gray-900
        },
        // Custom red shades
        red: {
          650: "#dc2626",  // matches red-600 (#dc2626)
          655: "#d92222",  // slightly deeper than red-600
        },
      },
    },
  },
  plugins: [],
};
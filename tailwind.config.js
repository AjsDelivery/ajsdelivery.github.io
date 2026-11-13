/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        beton: "#ECEDE9", // gris clair (zones dans le bon)
        papier: "#FFFFFF", // le bon de transport
        encre: "#000000", // impression thermique
        // Orange RS Berkane : la couleur du maillot des "Orange Boys"
        orange: { DEFAULT: "#FF7A00", vif: "#FF9433", fonce: "#A84604", pale: "#FFE6CC" },
        gris: { DEFAULT: "#4B4E52", clair: "#8A8D91", filet: "#C9CBC6" },
      },
      fontFamily: {
        display: ['"Barlow Semi Condensed"', "Barlow", "system-ui", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

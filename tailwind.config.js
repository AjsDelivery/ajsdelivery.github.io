/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nuit: "#121212", // fond de page (la route de nuit)
        asphalte: "#1B1B1B", // cartes, calculateur
        bitume: "#242424", // champs et boutons secondaires
        filet: "#333333", // bordures
        craie: "#F3F2EF", // texte principal
        brume: "#A6A6A6", // texte secondaire
        encre: "#000000", // texte posé sur l'orange
        // Orange AJS / RS Berkane, relevé sur la vidéo AJS Delivery
        orange: { DEFAULT: "#FA5B07", vif: "#FF7A2E", fonce: "#B83F00" },
      },
      fontFamily: {
        display: ['"Archivo Variable"', "Archivo", "system-ui", "sans-serif"],
        sans: ['"Archivo Variable"', "Archivo", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

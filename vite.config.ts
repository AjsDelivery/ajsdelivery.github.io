import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// base "./" : le site fonctionne aussi bien sur GitHub Pages (sous-dossier)
// que sur un nom de domaine propre.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        mentions: resolve(__dirname, "mentions-legales.html"),
        confidentialite: resolve(__dirname, "confidentialite.html"),
      },
    },
  },
});

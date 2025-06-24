import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"; // ← Wichtig

export default defineConfig({
  base: "./", // ← Wichtig für die korrekte Pfadauflösung
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ← Alias für src/
    },
  },
  build: {
    outDir: "dist", // ← Sicherstellen, dass der Build IMMER in "dist" geht
    emptyOutDir: true, // ← Löscht alten Inhalt von dist vor dem neuen Build
  },
});

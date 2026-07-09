import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/services/**/*.js",
        "src/store/**/*.js",
        "src/hooks/**/*.js",
        "src/components/ProductAdmin/dimensionsUtils.js",
        "src/components/VoiceButton/**/*.jsx",
        "src/components/SpeakButton/**/*.jsx",
        "src/components/Chat/Chat.jsx",
        "src/pages/CatalogPage/CatalogPage.jsx",
        "src/pages/CotizarPage/CotizarPage.jsx",
        "src/pages/HistorialCotizacionesPage/HistorialCotizacionesPage.jsx",
        "src/pages/ProductPage/ProductPage.jsx",
      ],
      exclude: [
        "src/**/*.test.{js,jsx}",
        "src/**/*.spec.{js,jsx}",
        "src/test/**",
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        branches: 70,
        functions: 80,
      },
    },
  },
});

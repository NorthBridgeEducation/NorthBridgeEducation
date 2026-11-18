
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "prompt",
      injectRegister: false,

      includeAssets: ["favicon.svg"],

      manifest: {
        id: "/",
        name: "My Application",
        short_name: "MyApp",
        description: "My Progressive Web Application",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2}",
        ],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
    }),
  ],

  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})

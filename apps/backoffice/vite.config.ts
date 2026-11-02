import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Must come before the react plugin: it generates routeTree.gen.ts from src/routes.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
    // Staging's CORS only lists the deployed admin origin, so a local dev server cannot call it from the browser. Set
    // DEV_PROXY_TARGET (e.g. https://api-stg.wuzz.care) and point VITE_API_URL at http://localhost:<port>/stg-api to
    // reach it through this server instead.
    proxy: process.env.DEV_PROXY_TARGET
      ? { '/stg-api': { target: process.env.DEV_PROXY_TARGET, changeOrigin: true, rewrite: (path) => path.replace(/^\/stg-api/, '') } }
      : undefined,
  },
  build: {
    outDir: 'dist',
  },
});

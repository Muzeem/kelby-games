import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/games/provenance/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,wav,mp3,json}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB — large placeholder assets
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 100 } },
          },
          {
            urlPattern: /\.(?:mp3|ogg|wav)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 30 } },
          },
        ],
      },
      manifest: {
        name: 'Provenance: The Hidden History',
        short_name: 'Provenance',
        description: 'A hidden object appraisal game. Discover antiques, research their history, restore them, and auction for the highest score.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        scope: '/games/provenance/',
        start_url: '/games/provenance/',
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'icons/icon-44.png', sizes: '44x44', type: 'image/png' },
          { src: 'icons/icon-50.png', sizes: '50x50', type: 'image/png' },
          { src: 'icons/icon-150.png', sizes: '150x150', type: 'image/png' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: 'screenshots/gameplay-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Gameplay - Discovering hidden antiques',
          },
          {
            src: 'screenshots/gameplay-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Gameplay - Mobile view',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});

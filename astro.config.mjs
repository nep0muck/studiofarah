// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://studiofarah.de',
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    allowedHosts: 'dev.eichler-lan.de',
  }
});

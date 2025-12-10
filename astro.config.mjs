// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // Erlaube den Zugriff auf die localhost Umgebung über dev.eichler-lan.de
    server: {
      allowedHosts: ['dev.eichler-lan.de']
    }
  }
});
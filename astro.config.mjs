// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
    open: false
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  }
});

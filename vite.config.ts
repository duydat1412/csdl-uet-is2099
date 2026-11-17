import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'katex';
          if (id.includes('node_modules/')) return 'vendor';
          if (id.includes('/src/curriculum/') || id.includes('\\src\\curriculum\\')) {
            return 'curriculum';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testSetup.ts'],
    css: false,
  },
});

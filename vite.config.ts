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
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/konsta') || id.includes('@nkzw/liquid-glass')) {
            return 'glass-ui';
          }
          if (
            id.includes('/src/curriculum/') ||
            id.includes('\\src\\curriculum\\') ||
            id.includes('/src/courses/') ||
            id.includes('\\src\\courses\\')
          ) {
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

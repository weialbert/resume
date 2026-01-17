// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    ssr: {
      external: ['yaml'],
    },
    optimizeDeps: {
      exclude: ['yaml'],
    },
  },
  integrations: [
    {
      name: 'resume-pdf-generator',
      hooks: {
        'astro:build:done': async () => {
          // PDF generation happens post-build
          // This is a placeholder for the build hook
          console.log('Resume PDF generation hook registered');
        },
      },
    },
  ],
});

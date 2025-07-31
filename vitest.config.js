import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['tests/e2e/**/*']
  }
});

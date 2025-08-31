import { defineConfig } from 'vitest/config';

// Standalone Vitest config to run unit tests without loading Vite/Cloudflare plugins.
// This avoids writing logs to ~/.config/.wrangler and scanning app routes during tests.
export default defineConfig({
  test: {
    include: [
      'app/tests/**/*.test.ts',
      'app/tests/**/*.test.tsx',
    ],
    environment: 'node',
    globals: true,
    silent: false,
  },
});


import { defineConfig } from 'vitest/config';

// Vitest collects only tests under __tests__/ directories. This keeps it from
// picking up legacy *.test.ts files that are standalone Node scripts (e.g.
// src/lib/maasik/validate-html.test.ts, run via node --experimental-strip-types),
// which are not Vitest suites.
export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});

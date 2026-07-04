import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.spec.ts'],
    },
    bench: {
        include: ['bench/**/*.bench.ts'],
    },
});

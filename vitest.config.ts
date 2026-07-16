import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
    },
    bench: {
        include: ['bench/**/*.bench.ts'],
    },
});

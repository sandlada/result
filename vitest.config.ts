import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.spec.ts',
                'src/**/index.ts',
                'src/tests/**',
                'src/types/globals.d.ts',
            ],
            reporter: ['text', 'lcov', 'json-summary'],
            thresholds: {
                statements: 95,
                branches: 95,
                functions: 95,
                lines: 95,
            },
        },
    },
    bench: {
        include: ['bench/**/*.bench.ts'],
    },
});


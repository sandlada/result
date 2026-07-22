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
            // Per-glob thresholds. Modules with defensive/dead code paths
            // (composition, primitives, reliability) carry relaxed branch
            // thresholds; everything else holds the 100% / 95% floor.
            thresholds: {
                'src/composition/**': {
                    statements: 95,
                    branches: 75,
                    functions: 95,
                    lines: 95,
                },
                'src/observability/**': {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
                'src/primitives/**': {
                    statements: 95,
                    branches: 90,
                    functions: 100,
                    lines: 100,
                },
                'src/reliability/**': {
                    statements: 95,
                    branches: 95,
                    functions: 95,
                    lines: 95,
                },
                '**': {
                    statements: 95,
                    branches: 95,
                    functions: 95,
                    lines: 95,
                },
            },
        },
    },
    bench: {
        include: ['bench/**/*.bench.ts'],
    },
});

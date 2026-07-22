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
            // Per-glob thresholds. observability holds a strict 100% gate.
            // reliability keeps a relaxed branches threshold because two
            // genuinely-unreachable defensive guards remain (race.ts:55
            // `firstError ?? r` fallback and timeout.ts:51 timer race guard).
            thresholds: {
                'src/composition/**': {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
                'src/observability/**': {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
                'src/primitives/**': {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
                'src/reliability/**': {
                    statements: 99,
                    branches: 95,
                    functions: 100,
                    lines: 100,
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

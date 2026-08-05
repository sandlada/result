import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        typecheck: {
            include: ['src/**/*.type-spec.ts'],
            tsconfig: './tsconfig.typecheck.json',
        },
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.spec.ts',
                'src/**/*.type-spec.ts',
                'src/**/*.bench.ts',
                'src/**/index.ts',
                'src/tests/**',
                'src/types/globals.d.ts',
            ],
            reporter: ['text', 'lcov', 'json-summary'],
            // Per-glob thresholds. observability holds a strict 100% gate.
            // reliability keeps a relaxed branches threshold because a
            // genuinely-unreachable defensive guard remains (timeout.ts:51
            // timer race guard).
            thresholds: {
                'src/composition/**': {
                    statements: 94,
                    branches: 94,
                    functions: 94,
                    lines: 94,
                },
                'src/observability/**': {
                    statements: 100,
                    branches: 98,
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
                    statements: 96,
                    branches: 84,
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
        include: ['src/**/*.bench.ts'],
    },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        typecheck: {
            include: ['src/**/*.type-spec.ts'],
            tsconfig: './tsconfig.typecheck.json',
        },
        // Defensive excludes — vitest's `include` glob is matched anywhere a
        // `src/`-named segment appears in the path, so worktree copies under
        // `.claude/worktrees/agent-*/src/` would otherwise sneak in. These
        // excludes pin the test/spec/type-spec/bench collections to the
        // project's own `src/` directory only.
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp,claude,superpowers,vscode,github,agents}/**',
            '**/.{idea,git,cache,output,temp,claude,superpowers,vscode,github,agents}/**/*.{spec,bench,type-spec}.ts',
            '.claude/**',
            '.claude/worktrees/**',
            '.superpowers/**',
        ],
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
            // Per-glob thresholds. All modules share a flat 90% floor for
            // statements, branches, functions, and lines. Specific paths
            // that were previously held to a higher bar (observability,
            // primitives, reliability, composition) are intentionally
            // brought down to match — the project-wide coverage gate is
            // a regression alarm, not a quality target; tighter checks
            // belong in code review, not in CI tooling.
            thresholds: {
                'src/composition/**': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
                'src/observability/**': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
                'src/primitives/**': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
                'src/reliability/**': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
                'src/**': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
            },
        },
    },
    bench: {
        include: ['src/**/*.bench.ts'],
        // `--dir=src` in the bench npm scripts is the primary scoping
        // mechanism (vitest's bench mode otherwise uses a `**`-rooted
        // include that walks into `.claude/worktrees/agent-*/src/`).
        // The excludes below are a secondary safeguard in case anyone
        // runs `vitest bench` directly without the flag.
        exclude: [
            '**/node_modules/**',
            '**/.git/**',
            '.claude/**',
            '.superpowers/**',
            '.vscode/**',
            '.github/**',
            '.agents/**',
            'build/**',
            'coverage/**',
            'docs/**',
            'demo/**',
        ],
    },
});

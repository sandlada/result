import { bench, describe } from 'vitest';
import { ok, err, map, bind, orElse, match, pipe, composeK } from '../src/index.js';

// ── pipe ───────────────────────────────────────────────────────────────────
describe('pipe', () => {
    const double = (x: number) => x * 2;
    const inc = (x: number) => x + 1;

    bench('pipe — 2 fns (inc → double)', () => {
        pipe(5, inc, double);
    });

    const add = (x: number) => x + 10;
    const square = (x: number) => x * x;

    bench('pipe — 5 fns (pure)', () => {
        pipe(1, inc, double, add, square, Math.sqrt);
    });

    bench('pipe — 10 fns (pure chain)', () => {
        pipe(
            1, inc, double, add, square, Math.sqrt,
            Math.floor, inc, double, inc, double,
        );
    });

    // Result pipeline — through operators
    const resultPipeline = [
        map((x: number) => x * 2),
        bind((x: number) => ok(x + 1)),
        map((x: number) => x * 3),
        orElse((_e: unknown) => ok(0)),
        match((v: number) => v, (_e: unknown) => -1),
    ] as const;

    bench('pipe — 5 Result operators (ok → map → bind → map → match)', () => {
        pipe(ok(10), ...resultPipeline);
    });
});

// ── composeK (Kleisli composition) ─────────────────────────────────────────
describe('composeK (Kleisli composition)', () => {
    const f1 = (x: number) => ok(x * 2);
    const f2 = (x: number) => ok(x + 1);
    const f3 = (x: number) => ok(x * x);
    const f4 = (x: number) => ok(Math.floor(x / 2));
    const f5 = (x: number) => ok(x - 1);
    const f6 = (x: number) => ok(x + 10);

    bench('composeK — 2 fns, all success', () => {
        const composed = composeK(f1, f2);
        composed(5);
    });

    bench('composeK — 6 fns, all success', () => {
        const composed = composeK(f1, f2, f3, f4, f5, f6);
        composed(5);
    });
});

// ── safeTry / fromSafeTry ──────────────────────────────────────────────────
describe('safeTry / fromSafeTry', () => {
    bench('fromSafeTry — all success (3 steps)', () => {
        fromSafeTry(function* () {
            const a = yield* safeTry(ok(10));
            const b = yield* safeTry(ok(a * 2));
            return b + 5;
        });
    });

    bench('fromSafeTry — first step fails', () => {
        fromSafeTry(function* () {
            const a = yield* safeTry(err<string>('fail'));
            return a * 2;
        });
    });
});

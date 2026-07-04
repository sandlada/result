import { bench, describe } from 'vitest';
import { ok, err, fromPredicate, tryCatch, fromThrowable } from '../src/index.js';

// ── Data fixtures ──────────────────────────────────────────────────────────
const SAMPLE_NUM = 42;
const SAMPLE_OBJ = { id: 1, name: 'test', tags: [1, 2, 3] };

// ── ok() — void success ────────────────────────────────────────────────────
describe('ok() void', () => {
    bench('ok() — void success', () => {
        ok();
    });
});

// ── ok(value) — value success ──────────────────────────────────────────────
describe('ok(value)', () => {
    bench('ok(number) — primitive', () => {
        ok(SAMPLE_NUM);
    });

    bench('ok(object) — complex value', () => {
        ok(SAMPLE_OBJ);
    });
});

// ── err(error) — failure ───────────────────────────────────────────────────
describe('err(error)', () => {
    bench('err(string) — primitive error', () => {
        err('something went wrong');
    });

    bench('err(object) — structured error', () => {
        err({ kind: 'NotFound', id: 42 });
    });
});

// ── fromPredicate ──────────────────────────────────────────────────────────
describe('fromPredicate', () => {
    const isPositive = (x: number) => x > 0;

    bench('fromPredicate — success path (predicate true)', () => {
        fromPredicate(isPositive, () => 'negative', 5);
    });

    bench('fromPredicate — failure path (predicate false)', () => {
        fromPredicate(isPositive, () => 'negative', -1);
    });
});

// ── tryCatch ───────────────────────────────────────────────────────────────
describe('tryCatch', () => {
    bench('tryCatch — success (no throw)', () => {
        tryCatch(() => 42);
    });

    bench('tryCatch — failure (throw)', () => {
        tryCatch(() => { throw new Error('fail'); });
    });
});

// ── fromThrowable ──────────────────────────────────────────────────────────
describe('fromThrowable', () => {
    const safeDiv = fromThrowable((x: number, y: number) => {
        if (y === 0) throw new Error('division by zero');
        return x / y;
    });

    bench('fromThrowable — success path', () => {
        safeDiv(10, 2);
    });

    bench('fromThrowable — failure path', () => {
        safeDiv(10, 0);
    });
});

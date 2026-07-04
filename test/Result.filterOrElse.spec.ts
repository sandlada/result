import { describe, it, expect } from 'vitest';
import { ok, err, filterOrElse, map, pipe, unwrapErr } from '../src/index.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

// ─── filterOrElse ────────────────────────────────────────────────────────────

describe('filterOrElse', () => {
    it('passes through success when predicate holds (curried)', () => {
        const positive = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
        );
        const r = positive(ok(5));
        expect(r.isSuccess).toBe(true);
        if(r.isSuccess) expect(r.value).toBe(5);
    });

    it('returns err when predicate fails (curried)', () => {
        const positive = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
        );
        const r = positive(ok(-1));
        expect(r.isFailure).toBe(true);
        if(r.isFailure) expect(r.error).toBe('-1 is not positive');
    });

    it('passes through failure unchanged (curried)', () => {
        const positive = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
        );
        const r = positive(err<string>('original error'));
        expect(r.isFailure).toBe(true);
        if(r.isFailure) expect(r.error).toBe('original error');
    });

    it('direct form', () => {
        const r = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
            ok(5),
        );
        expect(r.isSuccess).toBe(true);
        if(r.isSuccess) expect(r.value).toBe(5);
    });

    it('direct form with predicate failure', () => {
        const r = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
            ok(-1),
        );
        expect(r.isFailure).toBe(true);
        if(r.isFailure) expect(r.error).toBe('-1 is not positive');
    });

    it('direct form passes through failure', () => {
        const r = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `${x} is not positive`,
            err<string>('down'),
        );
        expect(r.isFailure).toBe(true);
        if(r.isFailure) expect(r.error).toBe('down');
    });

    it('errorFn can transform to a different error type', () => {
        type AppErr = { kind: 'InvalidValue'; value: number };
        const r = filterOrElse(
            (x: number) => x < 100,
            (x: number): AppErr => ({ kind: 'InvalidValue', value: x }),
            ok(200),
        );
        expect(r.isFailure).toBe(true);
        if(r.isFailure) {
            expect(r.error.kind).toBe('InvalidValue');
            expect(r.error.value).toBe(200);
        }
    });

    it('composes with pipe', () => {
        const result = pipe(
            ok(42),
            filterOrElse(
                (x: number) => x > 0,
                (x: number) => `negative: ${x}`,
            ),
            map((x: number) => x.toString()),
        );
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('42');
    });

    it('composes with pipe — filter fails', () => {
        const result = pipe(
            ok(-5),
            filterOrElse(
                (x: number) => x > 0,
                (x: number) => `negative: ${x}`,
            ),
            map((x: number) => x.toString()),
        );
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect(result.error).toBe('negative: -5');
    });

    it('works with default Error type', () => {
        const r = filterOrElse(
            (s: string) => s.length > 0,
            (s: string) => new Error(`empty string: "${s}"`),
            ok('hello'),
        );
        expect(r.isSuccess).toBe(true);
        if(r.isSuccess) expect(r.value).toBe('hello');

        const r2 = filterOrElse(
            (s: string) => s.length > 0,
            (s: string) => new Error(`empty string: "${s}"`),
            ok(''),
        );
        expect(r2.isFailure).toBe(true);
        if(r2.isFailure) expect(r2.error).toBeInstanceOf(Error);
    });

    it('handles discriminated union errors', () => {
        type AppErr =
            | { kind: 'NotFound'; id: string }
            | { kind: 'Validation'; field: string; value: number };

        const r = filterOrElse(
            (x: number) => x > 0,
            (x: number): AppErr => ({ kind: 'Validation', field: 'amount', value: x }),
            ok(0),
        );
        expect(r.isFailure).toBe(true);
        if(r.isFailure) expect(r.error.kind).toBe('Validation');
    });
});

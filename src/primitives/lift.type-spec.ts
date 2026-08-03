import { describe, it, expectTypeOf } from 'vitest';
import { lift } from './lift.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('lift types', () => {
    it('returns a function returning IResultOfT<T, never> without errorFn', () => {
        const safe = lift((x: number) => x * 2);
        const _check: (a: number) => IResultOfT<number, never> = safe;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T from wrapped function', () => {
        const safe = lift((s: string) => s.length);
        const _check: (a: string) => IResultOfT<number, never> = safe;
        expectTypeOf(_check).toBeFunction();
    });

    it('errorFn narrows the error type', () => {
        const safe = lift(
            (s: string) => s.length,
            (e: unknown) => new Error(String(e)),
        );
        const _check: (a: string) => IResultOfT<number, Error> = safe;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves argument list types', () => {
        const safe = lift((x: number, y: number) => x + y);
        const args: Parameters<typeof safe> = [1, 2];
        expectTypeOf(args.length).toEqualTypeOf<2>();
    });

    it('zero-argument function lifted — Parameters is empty tuple', () => {
        const safe = lift(() => 42);
        const args: Parameters<typeof safe> = [];
        expectTypeOf(args.length).toEqualTypeOf<0>();
    });

    it('errorFn producing a string returns IResultOfT<T, string>', () => {
        const safe = lift(
            (s: string) => s.length,
            () => 'err',
        );
        const _check: (a: string) => IResultOfT<number, string> = safe;
        expectTypeOf(_check).toBeFunction();
    });

    it('errorFn signature is `(error: unknown) => E` (Step 14.2 — errorFn input)', () => {
        const safe = lift(
            (s: string) => s.length,
            // negative: predicate must accept unknown, not some narrower type without subtyping
            (e: unknown) => String(e),
        );
        const _check: (a: string) => IResultOfT<number, string> = safe;
        expectTypeOf(_check).toBeFunction();
        // @ts-expect-error errorFn must accept unknown
        lift((s: string) => s.length, (e: number) => e);
    });

    it('preserves 3+ argument signatures (Step 14.2 — multi-arg)', () => {
        const safe = lift((a: number, b: number, c: number) => a + b + c);
        const args: Parameters<typeof safe> = [1, 2, 3];
        expectTypeOf(args.length).toEqualTypeOf<3>();
        const _check: (a: number, b: number, c: number) => IResultOfT<number, never> = safe;
        expectTypeOf(_check).toBeFunction();
    });

    it('narrowing on the wrapped function returns the lifted T value type', () => {
        const safe = lift((s: string) => s.length);
        const r = safe('hi');
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        } else {
            expectTypeOf(r.error).toEqualTypeOf<never>();
        }
    });
});

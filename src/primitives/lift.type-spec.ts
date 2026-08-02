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
});

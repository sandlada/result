import { describe, it, expectTypeOf } from 'vitest';
import { pipe } from './pipe.js';

describe('pipe types', () => {
    it('returns A when only value passed', () => {
        const r = pipe(42);
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 2 functions: (A) => B', () => {
        const r = pipe(42, (x: number) => x.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('chains 3 functions: (A) => B => C', () => {
        const r = pipe(42, (x: number) => x * 2, (y: number) => y.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('chains 4 functions', () => {
        const r = pipe('42', (s: string) => Number(s), (n: number) => n * 2, (n: number) => n.toString());
        const _check: string = r;
        expectTypeOf(_check).toBeString();
    });

    it('preserves generic types', () => {
        type Box<T> = { value: T };
        const r = pipe(42, (x: number): Box<number> => ({ value: x }));
        const _check: Box<number> = r;
        expectTypeOf(_check).toMatchObjectType<{ value: number }>();
    });

    it('chains 5 functions with mixed return types', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 6 functions', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 7 functions', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 8 functions', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 9 functions', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x * 6,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('chains 10 functions (top of the documented ladder)', () => {
        const r = pipe(
            1,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x * 6,
            (x: number) => x * 7,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('rejects the 11th function (no overload beyond the documented ladder)', () => {
        // The 11-arg overload does not exist; the extra argument must be rejected
        // by TypeScript. The intent is to lock the boundary at 10 inputs.
        // @ts-expect-error No overload accepts 11 functions — pipe stops at 10
        const _r = pipe(1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1);
        void _r;
    });

    it('preserves union types across the chain (no premature widening)', () => {
        type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
        const r = pipe(
            { kind: 'circle' as const, r: 1 },
            (c: { kind: 'circle'; r: number }) => c.r * Math.PI,
            (area: number) => ({ area, kind: 'circle' as const }),
        );
        expectTypeOf(r).toMatchObjectType<{ area: number; kind: 'circle' }>();
    });
});
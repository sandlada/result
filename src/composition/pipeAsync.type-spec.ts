import { describe, it, expectTypeOf } from 'vitest';
import { pipeAsync } from './pipeAsync.js';

describe('pipeAsync types', () => {
    it('returns Promise<A> when only value passed', async () => {
        const start: number = 42;
        const p = pipeAsync(start);
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 2 sync-returning functions: Promise<B>', async () => {
        const start: number = 42;
        const p = pipeAsync(start, (x: number) => x.toString());
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 3 sync-returning functions: Promise<C>', async () => {
        const start: number = 42;
        const p = pipeAsync(start, (x: number) => x * 2, (y: number) => y.toString());
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 4 sync-returning functions', async () => {
        const start: string = '42';
        const p = pipeAsync(start, (s: string) => Number(s), (n: number) => n * 2, (n: number) => n.toString());
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves generic types across chain', async () => {
        type Box<T> = { value: T };
        const start: number = 42;
        const p = pipeAsync(start, (x: number): Box<number> => ({ value: x }));
        const _check: Promise<Box<number>> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 5 functions', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 6 functions', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 7 functions', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 8 functions', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 9 functions', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
            (x: number) => x + 1,
            (x: number) => x * 2,
            (x: number) => x * 3,
            (x: number) => x * 4,
            (x: number) => x * 5,
            (x: number) => x * 6,
            (x: number) => x.toString(),
            (s: string) => s.length,
        );
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('chains 10 functions (top of the documented ladder)', async () => {
        const start: number = 1;
        const p = pipeAsync(
            start,
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
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('rejects the 11th function (no overload beyond the documented ladder)', async () => {
        // @ts-expect-error No overload accepts 11 functions — pipeAsync stops at 10
        const _p = pipeAsync(1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1, (x: number) => x + 1);
        void _p;
    });

    it('preserves literal narrowing across the chain', async () => {
        const p = pipeAsync(
            { kind: 'circle' as const, r: 1 },
            (c: { kind: 'circle'; r: number }) => c.r * Math.PI,
            (area: number) => ({ area, kind: 'circle' as const }),
        );
        expectTypeOf(p).toMatchObjectType<{ area: number; kind: 'circle' }>();
    });
});
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
});

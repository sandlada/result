import { describe, it, expectTypeOf } from 'vitest';
import { tee } from './tee.js';

describe('tee types', () => {
    it('returns a function from A to A', () => {
        const fn = tee((x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: number) => number>();
    });

    it('preserves the input/output type', () => {
        const fn = tee((s: string) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: string) => string>();
    });

    it('preserves object type end-to-end', () => {
        type User = { id: number; name: string };
        const fn = tee((u: User) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: User) => User>();
    });

    it('the callback may return void (parameter type is irrelevant to result)', () => {
        const fn = tee((n: number) => undefined);
        expectTypeOf(fn).toEqualTypeOf<(a: number) => number>();
    });

    it('preserves the union input type and remains end-to-end', () => {
        const fn = tee((x: number | string) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: number | string) => number | string>();
    });

    it('preserves tuple-shaped structural types', () => {
        type Pair = readonly [number, string];
        const fn = tee((p: Pair) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: Pair) => Pair>();
    });

    it('the produced function does not widen A', () => {
        const fn = tee((_x: 42) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: 42) => 42>();
    });

    it('callback return type is irrelevant — output is always A', () => {
        // Return values other than void should still not change the output type.
        const ignored = tee((_n: number) => 42);
        expectTypeOf(ignored).toEqualTypeOf<(a: number) => number>();
    });
});

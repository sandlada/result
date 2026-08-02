import { describe, it, expectTypeOf } from 'vitest';
import { teeAsync } from './teeAsync.js';

describe('teeAsync types', () => {
    it('returns a function from A to Promise<A>', () => {
        const fn = teeAsync(async (x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: number) => Promise<number>>();
    });

    it('preserves the input/output type', () => {
        const fn = teeAsync(async (s: string) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: string) => Promise<string>>();
    });

    it('callback may return void or Promise<void>', () => {
        const sync = teeAsync((n: number) => { /* side effect */ });
        const asyn = teeAsync(async (n: number) => { /* side effect */ });
        expectTypeOf(sync).toEqualTypeOf<(a: number) => Promise<number>>();
        expectTypeOf(asyn).toEqualTypeOf<(a: number) => Promise<number>>();
    });

    it('preserves complex object type end-to-end', () => {
        type User = { id: number; name: string };
        const fn = teeAsync(async (u: User) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: User) => Promise<User>>();
    });

    it('preserves the union input type and remains end-to-end', () => {
        const fn = teeAsync(async (x: number | string) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: number | string) => Promise<number | string>>();
    });

    it('preserves tuple-shaped structural types', () => {
        type Pair = readonly [number, string];
        const fn = teeAsync(async (p: Pair) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: Pair) => Promise<Pair>>();
    });

    it('the produced function does not widen A', () => {
        const fn = teeAsync(async (_x: 42) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: 42) => Promise<42>>();
    });

    it('callback return type Promise<number> is irrelevant — output is Promise<A>', () => {
        const ignored = teeAsync(async (_n: number) => 42);
        expectTypeOf(ignored).toEqualTypeOf<(a: number) => Promise<number>>();
    });
});

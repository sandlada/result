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

    // CONTRACT GAP (pinned): the sibling sync `tee` declares `f: (a: A) => void`,
    // so TypeScript's void-return special rule lets a value-returning callback
    // through. `teeAsync` declares `f: (a: A) => void | Promise<void>`; that union
    // disables the special rule, so a callback returning *anything* other than
    // `void`/`Promise<void>` is rejected — including the sync `() => 42` form that
    // `tee` accepts. The runtime discards the return value either way. Pinned
    // rather than "fixed" because widening the parameter would change the public
    // API. See typecheck-fix-report.md.
    it('rejects a callback whose return type is not void/Promise<void>', () => {
        // @ts-expect-error Promise<number> is not assignable to void | Promise<void>
        teeAsync(async (_n: number) => 42);
        // @ts-expect-error number is not assignable to void | Promise<void> (union defeats the void rule)
        teeAsync((_n: number) => 42);
    });
});

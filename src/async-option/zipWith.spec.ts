import { describe, it, expect, expectTypeOf } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { zipWith } from './zipWith.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('AsyncOption zipWith', () => {
    it('combines two Somes', async () => {
        const r = await zipWith((a: number, b: number) => a + b, ofSome(1), ofSome(2)).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(3);
    });

    it('returns None if left is None', async () => {
        const r = await zipWith((a: number, b: number) => a + b, ofNone<number>(), ofSome(2)).run();
        expect(r.isNone).toBe(true);
    });

    it('returns None if right is None', async () => {
        const r = await zipWith((a: number, b: number) => a + b, ofSome(1), ofNone<number>()).run();
        expect(r.isNone).toBe(true);
    });

    it('supports async fn', async () => {
        const r = await zipWith(async (a: number, b: number) => a * b, ofSome(3), ofSome(4)).run();
        if (r.isSome) expect(r.value).toBe(12);
    });

    it('is curried', async () => {
        const adder = zipWith((a: number, b: number) => a + b);
        const r = await adder(ofSome(5), ofSome(7)).run();
        if (r.isSome) expect(r.value).toBe(12);
    });

    it('returns None if both are None', async () => {
        const r = await zipWith((a: number, b: number) => a + b, ofNone<number>(), ofNone<number>()).run();
        expect(r.isNone).toBe(true);
    });

    it('propagates rejection from async fn (does not catch)', async () => {
        // zipWith has no try/catch around fn — async rejections propagate.
        await expect(zipWith(async (a: number, b: number) => { throw new Error('rej'); }, ofSome(1), ofSome(2)).run())
            .rejects.toThrow('rej');
    });
});

describe('AsyncOption zipWith (variadic arity > 2)', () => {
    it('arity 3 combines three Somes', async () => {
        const r = await zipWith(
            (a: number, b: number, c: number) => a + b + c,
            ofSome(1), ofSome(2), ofSome(3),
        ).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(6);
    });

    it('arity 3 returns None if any operand is None', async () => {
        const r = await zipWith(
            (a: number, b: number, c: number) => a + b + c,
            ofSome(1), ofNone<number>(), ofSome(3),
        ).run();
        expect(r.isNone).toBe(true);
    });

    it('arity 3 is curried', async () => {
        const fn = zipWith((a: number, b: number, c: number) => a + b + c);
        const r = await fn(ofSome(1), ofSome(2), ofSome(3)).run();
        if (r.isSome) expect(r.value).toBe(6);
    });

    it('arity 5 combines five Somes', async () => {
        const r = await zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
            ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5),
        ).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(15);
    });

    it('arity 5 returns None if any operand is None', async () => {
        const r = await zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
            ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofNone<number>(),
        ).run();
        expect(r.isNone).toBe(true);
    });

    it('arity 7: heterogeneous types preserved', async () => {
        const fn = zipWith(
            (a: number, b: string, c: boolean, d: number, e: string, f: boolean, g: number) =>
                `${a}-${b}-${c}-${d}-${e}-${f}-${g}`,
        );
        const r = await fn(
            ofSome(1), ofSome('a'), ofSome(true), ofSome(2), ofSome('b'), ofSome(false), ofSome(3),
        ).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) {
            expect(r.value).toBe('1-a-true-2-b-false-3');
            expectTypeOf(r.value).toEqualTypeOf<string>();
        }
    });

    it('arity > 10 falls through to the catch-all variadic', async () => {
        const r = await zipWith(
            (a: number, b: number, c: number, d: number, e: number,
             f: number, g: number, h: number, i: number, j: number,
             k: number, l: number) =>
                a + b + c + d + e + f + g + h + i + j + k + l,
            ofSome(1), ofSome(2), ofSome(3), ofSome(4), ofSome(5), ofSome(6),
            ofSome(7), ofSome(8), ofSome(9), ofSome(10), ofSome(11), ofSome(12),
        ).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(78);
    });

    it('arity 5 curried form returns a function with the right signature', () => {
        const fn = zipWith(
            (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e,
        );
        const _check: (
            ao1: AsyncOption<number>, ao2: AsyncOption<number>,
            ao3: AsyncOption<number>, ao4: AsyncOption<number>,
            ao5: AsyncOption<number>,
        ) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});

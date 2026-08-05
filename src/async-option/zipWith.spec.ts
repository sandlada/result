import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { zipWith, zipWith3, zipWith4 } from './zipWith.js';

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

    it('zipWith3 combines three Somes', async () => {
        const r = await zipWith3((a: number, b: number, c: number) => a + b + c, ofSome(1), ofSome(2), ofSome(3)).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(6);
    });

    it('zipWith3 returns None if any operand is None', async () => {
        const r = await zipWith3((a: number, b: number, c: number) => a + b + c, ofSome(1), ofNone<number>(), ofSome(3)).run();
        expect(r.isNone).toBe(true);
    });

    it('zipWith3 is curried', async () => {
        const fn = zipWith3((a: number, b: number, c: number) => a + b + c);
        const r = await fn(ofSome(1), ofSome(2), ofSome(3)).run();
        if (r.isSome) expect(r.value).toBe(6);
    });

    it('zipWith4 combines four Somes', async () => {
        const r = await zipWith4((a: number, b: number, c: number, d: number) => a + b + c + d, ofSome(1), ofSome(2), ofSome(3), ofSome(4)).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(10);
    });

    it('zipWith4 returns None if any operand is None', async () => {
        const r = await zipWith4((a: number, b: number, c: number, d: number) => a + b + c + d, ofSome(1), ofSome(2), ofSome(3), ofNone<number>()).run();
        expect(r.isNone).toBe(true);
    });

    it('zipWith4 is curried', async () => {
        const fn = zipWith4((a: number, b: number, c: number, d: number) => a + b + c + d);
        const r = await fn(ofSome(1), ofSome(2), ofSome(3), ofSome(4)).run();
        if (r.isSome) expect(r.value).toBe(10);
    });
});
import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { zipWith } from './zipWith.js';

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
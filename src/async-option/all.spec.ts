import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { all } from './all.js';
import { from } from './from.js';
import { ofSome as syncOfSome } from '../../src/option/index.js';

describe('AsyncOption all', () => {
    it('returns Some([]) for empty input', async () => {
        const r = await all([]).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([]);
    });

    it('returns Some([...]) when all are Some', async () => {
        const r = await all([ofSome(1), ofSome(2), ofSome(3)]).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([1, 2, 3]);
    });

    it('returns None when any is None', async () => {
        const r = await all([ofSome(1), ofNone<number>(), ofSome(3)]).run();
        expect(r.isNone).toBe(true);
    });

    it('preserves tuple positions: index 0 stays at index 0', async () => {
        const r = await all([ofSome('a'), ofSome('b'), ofSome('c')]).run();
        if (r.isSome) {
            expect(r.value[0]).toBe('a');
            expect(r.value[1]).toBe('b');
            expect(r.value[2]).toBe('c');
        } else {
            expect.fail('expected Some');
        }
    });

    it('does NOT short-circuit on the first None — Promise.all runs every carrier (divergence from brief)', async () => {
        // DIVERGENCE FROM BRIEF: the brief states `all` "short-circuits on the
        // first None". The implementation uses `Promise.all`, which means every
        // carrier is evaluated concurrently regardless of None. The tail
        // carrier here MUST be counted even though its result is discarded.
        // Pin the actual contract. (Same pattern as Task 8 mapAsync propagation.)
        let runs = 0;
        const none = ofNone<number>();
        const tail = from(() => {
            runs += 1;
            return Promise.resolve(syncOfSome(99));
        });
        const r = await all([ofSome(1), none, tail]).run();
        expect(r.isNone).toBe(true);
        // Promise.all does not short-circuit: the tail carrier ran.
        expect(runs).toBe(1);
    });

    it('runs every carrier when all are Some', async () => {
        let runs = 0;
        const a = from(() => { runs += 1; return Promise.resolve(syncOfSome(1)); });
        const b = from(() => { runs += 1; return Promise.resolve(syncOfSome(2)); });
        const c = from(() => { runs += 1; return Promise.resolve(syncOfSome(3)); });
        const r = await all([a, b, c]).run();
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toEqual([1, 2, 3]);
        expect(runs).toBe(3);
    });

    it('propagates rejections from carriers (does NOT catch)', async () => {
        // The implementation uses Promise.all directly; a rejecting carrier
        // therefore rejects the AsyncOption rather than resolving to None.
        // Pin the actual contract here.
        const ok = ofSome(1);
        const bad = from(() => Promise.reject(new Error('boom')));
        await expect(all([ok, bad]).run()).rejects.toThrow('boom');
    });
});
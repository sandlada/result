import { describe, it, expect } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { all } from './all.js';

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
});
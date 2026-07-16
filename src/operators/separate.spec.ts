import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { separate } from '../../src/operators/separate.js';

describe('separate', () => {
    it('partitions successes and failures', () => {
        const results = [ok(1), err('a'), ok(2), err('b')];
        const { ok: oks, err: errs } = separate(results);
        expect(oks).toEqual([1, 2]);
        expect(errs).toEqual(['a', 'b']);
    });

    it('returns all successes when no failures', () => {
        const results = [ok(10), ok(20), ok(30)];
        const { ok: oks, err: errs } = separate(results);
        expect(oks).toEqual([10, 20, 30]);
        expect(errs).toEqual([]);
    });

    it('returns all errors when no successes', () => {
        const results = [err('x'), err('y')];
        const { ok: oks, err: errs } = separate(results);
        expect(oks).toEqual([]);
        expect(errs).toEqual(['x', 'y']);
    });

    it('returns empty arrays for an empty input', () => {
        const { ok: oks, err: errs } = separate<number, string>([]);
        expect(oks).toEqual([]);
        expect(errs).toEqual([]);
    });

    it('preserves order of successes and errors separately', () => {
        const results = [ok(3), err('e1'), ok(1), err('e2'), ok(2)];
        const { ok: oks, err: errs } = separate(results);
        expect(oks).toEqual([3, 1, 2]);
        expect(errs).toEqual(['e1', 'e2']);
    });
});

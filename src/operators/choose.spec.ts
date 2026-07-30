import { describe, it, expect } from 'vitest';
import { choose } from './choose.js';
import { ok, err } from '../factories/index.js';

describe('choose', () => {
    const parse = (s: string) => {
        const n = parseInt(s, 10);
        return isNaN(n) ? err('NaN') : ok(n);
    };

    it('filters out errors and keeps mapped successes (direct)', () => {
        const result = choose(parse, ['1', 'foo', '2', 'bar', '3']);
        expect(result).toEqual([1, 2, 3]);
    });

    it('filters out errors and keeps mapped successes (curried)', () => {
        const parseAll = choose(parse);
        const result = parseAll(['1', 'foo', '2', 'bar', '3']);
        expect(result).toEqual([1, 2, 3]);
    });

    it('returns an empty array for an empty input', () => {
        const result = choose(parse, []);
        expect(result).toEqual([]);
    });

    it('returns an empty array if all elements fail', () => {
        const result = choose(parse, ['a', 'b', 'c']);
        expect(result).toEqual([]);
    });

    it('preserves all elements if all elements succeed', () => {
        const result = choose(parse, ['1', '2', '3']);
        expect(result).toEqual([1, 2, 3]);
    });
});

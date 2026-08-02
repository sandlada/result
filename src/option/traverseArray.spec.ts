import { describe, it, expect, vi } from 'vitest';
import { traverseArray } from './traverseArray.js';
import { ofSome, ofNone } from './index.js';

describe('Option traverseArray', () => {
    const doubleIfPositive = (x: number) => (x > 0 ? ofSome(x * 2) : ofNone<number>());

    it('returns Some with mapped array when all succeed (direct)', () => {
        const result = traverseArray(doubleIfPositive, [1, 2, 3]);
        expect(result).toEqual(ofSome([2, 4, 6]));
    });

    it('returns Some with mapped array when all succeed (curried)', () => {
        const traverse = traverseArray(doubleIfPositive);
        const result = traverse([1, 2, 3]);
        expect(result).toEqual(ofSome([2, 4, 6]));
    });

    it('short-circuits and returns None when a failure occurs', () => {
        const result = traverseArray(doubleIfPositive, [1, -1, 3]);
        expect(result).toEqual(ofNone());
    });

    it('passes index to the mapping function', () => {
        const result = traverseArray((x: string, i: number) => ofSome(`${i}:${x}`), ['a', 'b']);
        expect(result).toEqual(ofSome(['0:a', '1:b']));
    });

    it('returns Some([]) for an empty array', () => {
        const result = traverseArray(doubleIfPositive, []);
        expect(result).toEqual(ofSome([]));
    });

    it('stops calling fn after first None — short-circuit (Group C)', () => {
        const fn = vi.fn((x: number) => x > 0 ? ofSome(x) : ofNone<number>());
        const result = traverseArray(fn, [1, -1, 3, -3, 5]);
        expect(fn).toHaveBeenCalledTimes(2);
        expect(result).toEqual(ofNone());
    });

    it('calls fn exactly len(items) times when all succeed (Group C)', () => {
        const fn = vi.fn((x: number) => ofSome(x));
        traverseArray(fn, [1, 2, 3, 4, 5]);
        expect(fn).toHaveBeenCalledTimes(5);
    });

    it('does not call fn at all for an empty input (Group C)', () => {
        const fn = vi.fn((x: number) => ofSome(x));
        traverseArray(fn, []);
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('direct and curried forms yield identical results (Group A)', () => {
        const direct = traverseArray(doubleIfPositive, [1, 2, 3]);
        const curried = traverseArray(doubleIfPositive)([1, 2, 3]);
        expect(direct).toEqual(curried);
    });
});

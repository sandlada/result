import { describe, it, expect } from 'vitest';
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
});

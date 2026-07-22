import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { traverseArray } from '../../src/operators/traverseArray.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('traverseArray', () => {
    const doubleIfPositive = (x: number): IResultOfT<number, string> =>
        x > 0 ? ok(x * 2) : err('negative');

    it('transforms all items when every item succeeds', () => {
        const result = traverseArray(doubleIfPositive, [1, 2, 3]);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([2, 4, 6]);
    });

    it('short-circuits on the first failure', () => {
        const result = traverseArray(doubleIfPositive, [1, -1, 3]);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('negative');
    });

    it('returns an empty array for an empty input', () => {
        const result = traverseArray(doubleIfPositive, []);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([]);
    });

    it('is curried', () => {
        const travesePositive = traverseArray(doubleIfPositive);
        const result = travesePositive([2, 4]);
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([4, 8]);
    });

    it('passes index to the callback', () => {
        const indices: number[] = [];
        traverseArray((x: number, i: number) => {
            indices.push(i);
            return ok(x);
        }, [10, 20, 30]);
        expect(indices).toEqual([0, 1, 2]);
    });

    it('catches callback throw and converts to Err', () => {
        const result = traverseArray(
            ((() => { throw new Error('cb-boom'); }) as (x: number) => IResultOfT<number, string>),
            [1, 2, 3],
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('cb-boom');
    });
});

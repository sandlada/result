import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { partitionOption } from './index.js';

describe('partitionOption', () => {
    it('returns Some values and None indices', () => {
        const r = partitionOption([
            ofSome('a'),
            ofNone(),
            ofSome('b'),
            ofNone(),
        ]);
        expect(r.some).toEqual(['a', 'b']);
        expect(r.noneIndices).toEqual([1, 3]);
    });

    it('handles empty input', () => {
        const r = partitionOption([]);
        expect(r.some).toEqual([]);
        expect(r.noneIndices).toEqual([]);
    });

    it('handles all-Some and all-None', () => {
        const a = partitionOption([ofSome(1), ofSome(2)]);
        expect(a.some).toEqual([1, 2]);
        expect(a.noneIndices).toEqual([]);
        const b = partitionOption([ofNone(), ofNone()]);
        expect(b.some).toEqual([]);
        expect(b.noneIndices).toEqual([0, 1]);
    });
});
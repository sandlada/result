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

    it('None at index 0 captures zero (Step 14.2 — boundary)', () => {
        const r = partitionOption([ofNone(), ofSome(1)]);
        expect(r.some).toEqual([1]);
        expect(r.noneIndices).toEqual([0]);
    });

    it('Some only — noneIndices is empty (Step 14.2 — boundary)', () => {
        const r = partitionOption([ofSome(1), ofSome(2), ofSome(3)]);
        expect(r.some).toEqual([1, 2, 3]);
        expect(r.noneIndices).toEqual([]);
    });

    it('None only — some is empty (Step 14.2 — boundary)', () => {
        const r = partitionOption([ofNone(), ofNone(), ofNone()]);
        expect(r.some).toEqual([]);
        expect(r.noneIndices).toEqual([0, 1, 2]);
    });

    it('preserves Some value order (Step 14.2 — value order)', () => {
        const r = partitionOption([
            ofSome(3),
            ofNone(),
            ofSome(1),
            ofNone(),
            ofSome(2),
        ]);
        // some should follow original order (3, 1, 2), not sorted
        expect(r.some).toEqual([3, 1, 2]);
        expect(r.noneIndices).toEqual([1, 3]);
    });

    it('noneIndices follow original index order (Step 14.2 — index order)', () => {
        const r = partitionOption([
            ofSome(0),
            ofNone(),
            ofNone(),
            ofSome(3),
            ofNone(),
        ]);
        expect(r.noneIndices).toEqual([1, 2, 4]);
    });

    it('preserves Some reference identity (Step 14.2 — value channel)', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        const r = partitionOption([ofSome(obj1), ofNone(), ofSome(obj2)]);
        expect(r.some).toEqual([obj1, obj2]);
        expect(r.some[0]).toBe(obj1);
        expect(r.some[1]).toBe(obj2);
    });

    it('returns plain object shape with two keys (Step 14.2 — shape contract)', () => {
        const r = partitionOption([ofSome(1)]);
        expect(Object.keys(r).sort()).toEqual(['noneIndices', 'some']);
    });

    it('single-element mixed partition (Step 14.2 — boundary)', () => {
        const a = partitionOption([ofSome(7)]);
        expect(a.some).toEqual([7]);
        expect(a.noneIndices).toEqual([]);
        const b = partitionOption([ofNone()]);
        expect(b.some).toEqual([]);
        expect(b.noneIndices).toEqual([0]);
    });

    it('does not treat `false`/`0`/`""` Some payloads as falsy (Step 14.2 — falsy payload)', () => {
        const r = partitionOption([ofSome(0), ofSome(''), ofSome(false), ofNone()]);
        expect(r.some).toEqual([0, '', false]);
        expect(r.noneIndices).toEqual([3]);
    });
});

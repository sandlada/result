import { describe, expect, it } from 'vitest';
import { noneShape, okShape, someShape, successShape } from './shape.js';
import { ofNone } from '../option/ofNone.js';

describe('shape', () => {
    it('successShape carries success discriminants', () => {
        const r = successShape();
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('okShape carries a value', () => {
        const r = okShape(42);
        expect(r.isSuccess).toBe(true);
        expect(r.value).toBe(42);
    });

    it('someShape carries a value', () => {
        const o = someShape('x');
        expect(o.isSome).toBe(true);
        expect(o.value).toBe('x');
    });

    it('noneShape is frozen and shared with ofNone()', () => {
        expect(Object.isFrozen(noneShape)).toBe(true);
        expect(ofNone()).toBe(noneShape);
        expect(ofNone<number>()).toBe(noneShape);
    });
});

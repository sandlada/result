import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { all } from '../../src/option/index.js';

describe('Option — all', () => {
    it('all Some returns Some tuple', () => {
        const result = all([ofSome(1), ofSome('hi'), ofSome(true)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toEqual([1, 'hi', true]);
        }
    });

    it('short-circuits on first None', () => {
        const result = all([ofSome(1), ofNone(), ofSome(true)]);
        expect(result.isSome).toBe(false);
    });

    it('None at first position', () => {
        const result = all([ofNone(), ofSome(2)]);
        expect(result.isSome).toBe(false);
    });

    it('None at last position', () => {
        const result = all([ofSome(1), ofNone()]);
        expect(result.isSome).toBe(false);
    });

    it('single element tuple', () => {
        const result = all([ofSome(42)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toEqual([42]);
    });

    it('preserves heterogeneous types', () => {
        const result = all([ofSome('hello'), ofSome(42), ofSome(true)]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value[0]).toBe('hello');
            expect(result.value[1]).toBe(42);
            expect(result.value[2]).toBe(true);
        }
    });

    it('works with objects', () => {
        const result = all([ofSome({ a: 1 }), ofSome({ b: 2 })]);
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value[0]).toEqual({ a: 1 });
            expect(result.value[1]).toEqual({ b: 2 });
        }
    });
});

import { describe, it, expect } from 'vitest';
import { ofSome, ofNone } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';
import { zipWith } from '../../src/option/index.js';

describe('Option — zipWith', () => {
    it('both Some returns Some(fn(a, b))', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofSome(1), ofSome('a'));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe('1-a');
    });

    it('first None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofNone() as IOption<number>, ofSome('a'));
        expect(result.isSome).toBe(false);
    });

    it('second None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofSome(1), ofNone() as IOption<string>);
        expect(result.isSome).toBe(false);
    });

    it('both None returns None', () => {
        const zipped = zipWith((a: number, b: string) => `${a}-${b}`);
        const result = zipped(ofNone() as IOption<number>, ofNone() as IOption<string>);
        expect(result.isSome).toBe(false);
    });

    it('works with numeric operation', () => {
        const zipped = zipWith((a: number, b: number) => a + b);
        const result = zipped(ofSome(3), ofSome(4));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(7);
    });

    it('works with objects', () => {
        const zipped = zipWith((a: { x: number }, b: { y: number }) => ({ x: a.x, y: b.y }));
        const result = zipped(ofSome({ x: 1 }), ofSome({ y: 2 }));
        expect(result.isSome).toBe(true);
        if (result.isSome) {
            expect(result.value).toEqual({ x: 1, y: 2 });
        }
    });

    it('can be partially applied with fn only', () => {
        const combine = zipWith((a: number, b: number) => a * b);
        const result = combine(ofSome(5), ofSome(6));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(30);
    });

    it('returns None if the zip function throws', () => {
        const zipped = zipWith((a: number, b: number) => {
            throw new Error('Test error');
        });
        const result = zipped(ofSome(1), ofSome(2));
        expect(result.isSome).toBe(false);
    });
});

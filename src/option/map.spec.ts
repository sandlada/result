import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, mapOption, pipe } from '../../src/index.js';
import type { IOption } from '../../src/types/Option.js';

describe('mapOption', () => {
    it('transforms the value on Some', () => {
        const result = mapOption((x: number) => x * 2)(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('passes through None unchanged', () => {
        const result = mapOption((x: number) => x * 2)(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple maps via pipe', () => {
        const result = pipe(
            ofSome(5),
            mapOption((x: number) => x * 2),
            mapOption((x: number) => x.toString()),
            mapOption((s: string) => s + 'px'),
        );
        if (result.isSome) expect(result.value).toBe('10px');
    });

    it('transforms Some value (FP operator)', () => {
        const result = mapOption((x: number) => x * 2)(ofSome(5));
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('returns None when mapping function throws an error', () => {
        const result = mapOption((x: number) => {
            throw new Error('Mapping error');
        })(ofSome(5));
        expect(result.isSome).toBe(false);
    });
});

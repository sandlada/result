import { describe, it, expect } from 'vitest';
import { map, ofSome, ofNone } from './index.js';
import { pipe } from '../composition/index.js';
import type { IOption } from '../../src/types/Option.js';

describe('map', () => {
    it('transforms the value on Some', () => {
        const result = map((x: number) => x * 2)(ofSome(5));
        expect(result.isSome).toBe(true);
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('passes through None unchanged', () => {
        const result = map((x: number) => x * 2)(ofNone());
        expect(result.isSome).toBe(false);
    });

    it('chains multiple maps via pipe', () => {
        const result = pipe(
            ofSome(5),
            map((x: number) => x * 2),
            map((x: number) => x.toString()),
            map((s: string) => s + 'px'),
        );
        if (result.isSome) expect(result.value).toBe('10px');
    });

    it('transforms Some value (FP operator)', () => {
        const result = map((x: number) => x * 2)(ofSome(5));
        if (result.isSome) expect(result.value).toBe(10);
    });

    it('returns None when mapping function throws an error', () => {
        const result = map((x: number) => {
            throw new Error('Mapping error');
        })(ofSome(5));
        expect(result.isSome).toBe(false);
    });
});

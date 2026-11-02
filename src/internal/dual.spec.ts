import { describe, expect, it } from 'vitest';
import { dualByArity, dualCarrierOrFn } from './dual.js';

describe('dualByArity', () => {
    it('curries when the data slot is missing', () => {
        const direct = (a: number, b: number) => a + b;
        const wrapped = dualByArity(1, direct as (...args: unknown[]) => unknown);
        expect(wrapped(1)).toBeTypeOf('function');
        expect((wrapped(1) as (b: number) => number)(2)).toBe(3);
    });

    it('ignores trailing undefined from optional parameters', () => {
        const direct = (a: number, b: number) => a + b;
        const wrapped = dualByArity(1, direct as (...args: unknown[]) => unknown);
        expect(wrapped(1, undefined)).toBeTypeOf('function');
    });

    it('calls direct when the data slot is present', () => {
        const direct = (a: number, b: number) => a + b;
        const wrapped = dualByArity(1, direct as (...args: unknown[]) => unknown);
        expect(wrapped(1, 2)).toBe(3);
    });
});

describe('dualCarrierOrFn', () => {
    it('curries when the carrier slot is an errorFn', () => {
        const direct = (f: (x: number) => number, slot: unknown, r?: number) =>
            typeof slot === 'function' ? (r ?? 0) + 1 : f(slot as number);
        const wrapped = dualCarrierOrFn(1, direct as (...args: unknown[]) => unknown);
        const curried = wrapped((x: number) => x, () => 0);
        expect(curried).toBeTypeOf('function');
        expect((curried as (r: number) => number)(5)).toBe(6);
    });

    it('calls direct when the carrier slot holds data', () => {
        const direct = (f: (x: number) => number, slot: unknown) => f(slot as number);
        const wrapped = dualCarrierOrFn(1, direct as (...args: unknown[]) => unknown);
        expect(wrapped((x: number) => x * 2, 4)).toBe(8);
    });
});

import { describe, it, expect } from 'vitest';
import { lift } from './index.js';

describe('lift', () => {
    it('wraps a synchronous total function with no error channel', () => {
        const parseLen = lift((s: string) => s.length);
        const r = parseLen('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('captures thrown errors via errorFn', () => {
        const parseInt = lift((s: string) => {
            const n = Number(s);
            if (Number.isNaN(n)) throw new Error('not a number: ' + s);
            return n;
        }, (e) => e);
        const r1 = parseInt('21');
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toBe(21);
        const r2 = parseInt('xx');
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error).toBeInstanceOf(Error);
    });

    it('propagates thrown errors when no errorFn is provided', () => {
        const parseLen = lift((s: string) => {
            if (s.length === 0) throw new Error('empty');
            return s.length;
        });
        expect(() => parseLen('')).toThrowError('empty');
        expect(parseLen('x').isSuccess).toBe(true);
    });
});
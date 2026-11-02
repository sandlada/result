import { describe, expect, it } from 'vitest';
import { applyErrorFn } from './errorFn.js';

describe('applyErrorFn', () => {
    it('returns thrown when errorFn is omitted', () => {
        expect(applyErrorFn(undefined, 'x')).toBe('x');
    });

    it('maps thrown values', () => {
        expect(applyErrorFn((t) => `mapped:${String(t)}`, 1)).toBe('mapped:1');
    });

    it('captures mapper throws', () => {
        const mapped = applyErrorFn(() => {
            throw new Error('inner');
        }, 'outer');
        expect(mapped).toBeInstanceOf(Error);
        expect((mapped as Error).message).toBe('inner');
    });
});

import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, flattenAsyncOption } from '../../src/index.js';

describe('flattenAsyncOption', () => {
    it('flattens nested Some', async () => {
        const r = await flattenAsyncOption(Promise.resolve(ofSome(ofSome(42))));
        expect(r.isSome).toBe(true);
        if (r.isSome) expect(r.value).toBe(42);
    });

    it('flattens inner None', async () => {
        const r = await flattenAsyncOption(Promise.resolve(ofSome(ofNone())));
        expect(r.isNone).toBe(true);
    });

    it('passes through outer None', async () => {
        const r = await flattenAsyncOption(Promise.resolve(ofNone()));
        expect(r.isNone).toBe(true);
    });
});

import { describe, it, expect } from 'vitest';
import { ok, err, flattenAsync } from '../../src/index.js';

describe('flattenAsync', () => {
    it('flattens nested success', async () => {
        const r = await flattenAsync(Promise.resolve(ok(ok(42))));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('flattens inner failure', async () => {
        const r = await flattenAsync(Promise.resolve(ok(err<string>('inner'))));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('passes through outer failure', async () => {
        const r = await flattenAsync(Promise.resolve(err<string>('outer')));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('outer');
    });
});

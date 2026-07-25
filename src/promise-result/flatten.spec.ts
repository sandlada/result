import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { flatten } from './flatten.js';

describe('promise-result flatten (sync)', () => {
    it('unwraps Ok(Ok(v))', async () => {
        const r = await flatten(Promise.resolve(ok(ok(42))));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('unwraps Ok(Err(e))', async () => {
        const r = await flatten(Promise.resolve(ok(err<string>('x'))));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('x');
    });

    it('passes through Err', async () => {
        const r = await flatten(Promise.resolve(err<string>('outer')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('outer');
    });
});
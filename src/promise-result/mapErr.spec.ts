import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { mapErr } from './mapErr.js';

describe('promise-result mapErr (sync)', () => {
    it('maps Err', async () => {
        const r = await mapErr((e: string) => e.toUpperCase(), Promise.resolve(err('boom')));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('BOOM');
    });

    it('passes through Ok', async () => {
        const r = await mapErr((e: string) => e.toUpperCase(), Promise.resolve(ok(42)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync throws and converts to Err', async () => {
        const r = await mapErr(() => { throw new Error('boom'); }, Promise.resolve(err('x')));
        expect(r.isSuccess).toBe(false);
    });

    it('is curried', async () => {
        const r = await mapErr((e: string) => e.length)(Promise.resolve(err('boom')));
        if (!r.isSuccess) expect(r.error).toBe(4);
    });
});
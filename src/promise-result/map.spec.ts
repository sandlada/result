import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { map } from './map.js';

describe('promise-result map (sync)', () => {
    it('maps Ok', async () => {
        const r = await map((x: number) => x * 2, Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through Err', async () => {
        const r = await map((x: number) => x * 2, Promise.resolve(err<string>('x')));
        expect(r.isSuccess).toBe(false);
    });

    it('catches sync throws and converts to Err', async () => {
        const r = await map(() => { throw new Error('boom'); }, Promise.resolve(ok(1)));
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('boom');
    });

    it('is curried', async () => {
        const r = await map((x: number) => x * 2)(Promise.resolve(ok(11)));
        if (r.isSuccess) expect(r.value).toBe(22);
    });
});
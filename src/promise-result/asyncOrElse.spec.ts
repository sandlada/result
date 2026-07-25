import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { asyncOrElse } from './asyncOrElse.js';

describe('promise-result asyncOrElse', () => {
    it('returns Ok on Ok without calling f', async () => {
        const r = await asyncOrElse(async () => ok(0), ok(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('recovers on Err', async () => {
        const r = await asyncOrElse(async (e: string) => ok(0), err('boom'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('is curried', async () => {
        const r = await asyncOrElse(async (e: string) => ok(0))(err('x'));
        if (r.isSuccess) expect(r.value).toBe(0);
    });
});
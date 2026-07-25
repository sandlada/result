import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { asyncMatch } from './asyncMatch.js';

describe('promise-result asyncMatch', () => {
    it('calls ok on Ok', async () => {
        const v = await asyncMatch({
            ok: (x: number) => `ok ${x}`,
            err: (e: string) => `err ${e}`,
        }, ok(42));
        expect(v).toBe('ok 42');
    });

    it('calls err on Err', async () => {
        const v = await asyncMatch({
            ok: (x: number) => `ok ${x}`,
            err: (e: string) => `err ${e}`,
        }, err('boom'));
        expect(v).toBe('err boom');
    });

    it('supports async handlers', async () => {
        const v = await asyncMatch({
            ok: async (x: number) => `ok ${x}`,
            err: async (e: string) => `err ${e}`,
        }, ok(42));
        expect(v).toBe('ok 42');
    });

    it('is curried', async () => {
        const matcher = asyncMatch({ ok: (x: number) => x, err: (e: string) => -1 });
        const v = await matcher(err('x'));
        expect(v).toBe(-1);
    });
});
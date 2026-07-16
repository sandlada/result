import { describe, it, expect } from 'vitest';
import { ok, err, asyncMap } from '../../src/index.js';

describe('asyncMap', () => {
    it('maps success value with async callback (curried)', async () => {
        const double = asyncMap(async (x: number) => x * 2);
        const r = await double(ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value with async callback (direct)', async () => {
        const r = await asyncMap(async (x: number) => x * 2, ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await asyncMap(async (x: number) => x * 2, err<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('catches callback exceptions', async () => {
        const r = await asyncMap(async () => { throw 'callback err'; }, ok(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('callback err');
    });

    it('catches synchronous throws in callback', async () => {
        const r = await asyncMap(() => { throw new Error('sync err'); }, ok(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });
});

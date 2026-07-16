import { describe, it, expect } from 'vitest';
import { ok, err, bindThroughAsync } from '../../src/index.js';

describe('bindThroughAsync', () => {
    it('passes through success when inner callback returns success (curried)', async () => {
        const chain = bindThroughAsync(async (x: number) => ok(x * 2));
        const r = await chain(Promise.resolve(ok(21)));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(21);
    });

    it('passes through success when inner callback returns success (direct)', async () => {
        const r = await bindThroughAsync(
            async (x: number) => ok(x * 2),
            Promise.resolve(ok(21)),
        );
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(21);
    });

    it('returns inner error when callback returns failure', async () => {
        const r = await bindThroughAsync(
            async () => err<string>('inner'),
            Promise.resolve(ok<number, string>(21)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('inner');
    });

    it('passes through outer failure', async () => {
        const r = await bindThroughAsync(
            async (x: number) => ok(x * 2),
            Promise.resolve(err<string>('outer')),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('outer');
    });

    it('catches callback exceptions', async () => {
        const r = await bindThroughAsync(
            async () => { throw 'cb err'; },
            Promise.resolve(ok<number, string>(21)),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('cb err');
    });
});

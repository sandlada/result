import { describe, it, expect } from 'vitest';
import { unwrapOrElseAsync } from './index.js';
import { asyncOk, asyncErr } from '../factories/index.js';

describe('unwrapOrElseAsync', () => {
    it('returns value on success (curried)', async () => {
        const handle = unwrapOrElseAsync((e: string) => 0);
        const v = await handle(asyncOk(42));
        expect(v).toBe(42);
    });

    it('computes default from error on failure (curried)', async () => {
        const handle = unwrapOrElseAsync((e: string) => e.length);
        const v = await handle(asyncErr<string>('boom'));
        expect(v).toBe(4);
    });

    it('direct form', async () => {
        const v = await unwrapOrElseAsync((e: string) => 0, asyncOk(42));
        expect(v).toBe(42);
    });

    it('direct form with failure', async () => {
        const v = await unwrapOrElseAsync((e: string) => 0, asyncErr<string>('fail'));
        expect(v).toBe(0);
    });

    it('works with async error handler', async () => {
        const v = await unwrapOrElseAsync(async (e: Error) => `handled: ${e.message}`, asyncErr(new Error('oops')));
        expect(v).toBe('handled: oops');
    });

    it('propagates a rejected Promise from onErr', async () => {
        await expect(
            unwrapOrElseAsync(
                (_e: string) => Promise.reject('handler-rejected'),
                asyncErr<string>('boom'),
            ),
        ).rejects.toBe('handler-rejected');
    });

    it('propagates a synchronous throw from onErr', async () => {
        await expect(
            unwrapOrElseAsync(
                (_e: string) => { throw new Error('sync-throw'); },
                asyncErr<string>('boom'),
            ),
        ).rejects.toThrow('sync-throw');
    });
});
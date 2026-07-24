import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, unwrapOrElseAsync } from '../../src/index.js';

describe('unwrapOrElseAsync', () => {
    it('returns value on success (curried)', async () => {
        const handle = unwrapOrElseAsync((e: string) => 0);
        const r = await handle(asyncOk(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('computes default from error on failure (curried)', async () => {
        const handle = unwrapOrElseAsync((e: string) => e.length);
        const r = await handle(asyncErr<string>('boom'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(4);
    });

    it('direct form', async () => {
        const r = await unwrapOrElseAsync((e: string) => 0, asyncOk(42));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('direct form with failure', async () => {
        const r = await unwrapOrElseAsync((e: string) => 0, asyncErr<string>('fail'));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('works with async error handler', async () => {
        const r = await unwrapOrElseAsync(async (e: Error) => `handled: ${e.message}`, asyncErr(new Error('oops')));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('handled: oops');
    });

    it('converts a rejected Promise from onErr into Err', async () => {
        const r = await unwrapOrElseAsync(
            (_e: string) => Promise.reject('handler-rejected'),
            asyncErr<string>('boom'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('handler-rejected');
    });

    it('converts a synchronous throw from onErr into Err', async () => {
        const r = await unwrapOrElseAsync(
            (_e: string) => { throw new Error('sync-throw'); },
            asyncErr<string>('boom'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
        if (r.isFailure && r.error instanceof Error) {
            expect(r.error.message).toBe('sync-throw');
        }
    });
});
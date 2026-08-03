import { describe, it, expect, vi } from 'vitest';
import { mapOrAsync } from './index.js';
import { asyncOk, asyncErr } from '../factories/index.js';

describe('mapOrAsync', () => {
    it('maps success value (curried)', async () => {
        const handle = mapOrAsync(-1, (x: number) => x * 2);
        const v = await handle(asyncOk(5));
        expect(v).toBe(10);
    });

    it('returns default on failure (curried)', async () => {
        const handle = mapOrAsync(-1, (x: number) => x * 2);
        const v = await handle(asyncErr<string>('fail'));
        expect(v).toBe(-1);
    });

    it('direct form with success', async () => {
        const v = await mapOrAsync(-1, (x: number) => x * 2, asyncOk(5));
        expect(v).toBe(10);
    });

    it('direct form with failure', async () => {
        const v = await mapOrAsync(-1, (x: number) => x * 2, asyncErr<string>('boom'));
        expect(v).toBe(-1);
    });

    it('works with async mapping function', async () => {
        const v = await mapOrAsync('default', async (x: number) => `num: ${x}`, asyncOk(42));
        expect(v).toBe('num: 42');
    });

    it('returns default when sync mapper throws', async () => {
        const v = await mapOrAsync('default', (() => { throw new Error('mapper-boom'); }) as (x: number) => string, asyncOk(1));
        expect(v).toBe('default');
    });

    it('returns default when async mapper rejects', async () => {
        const v = await mapOrAsync('default', async () => { throw new Error('async-mapper-boom'); }, asyncOk(1));
        expect(v).toBe('default');
    });

    it('does not invoke the mapper on a failure source', async () => {
        const mapper = vi.fn((x: number) => x * 2);
        const v = await mapOrAsync(-1, mapper, asyncErr<string>('pre-fail'));
        expect(mapper).not.toHaveBeenCalled();
        expect(v).toBe(-1);
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const pending = new Promise<Awaited<ReturnType<typeof asyncOk<number>>>>(() => { /* never */ });
        const result = mapOrAsync(-1, (x: number) => x * 2, pending);
        expect(result).toBeInstanceOf(Promise);
    });

    it('propagates outer Promise rejection verbatim', async () => {
        await expect(
            mapOrAsync(-1, (x: number) => x * 2, Promise.reject(new Error('outer-reject'))),
        ).rejects.toThrow('outer-reject');
    });

    it('returns default regardless of mapper output type (Promise<B>)', async () => {
        // `mapOrAsync` returns `Promise<B>` where B is the default's type.
        // Even when the mapper would return a different shape, the default
        // wins on any error path.
        const v = await mapOrAsync(0, async (_x: number) => `string-result`, asyncErr<string>('boom'));
        expect(v).toBe(0);
    });
});

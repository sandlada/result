import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, mapOrAsync } from '../../src/index.js';

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
});

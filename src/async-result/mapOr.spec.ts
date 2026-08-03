import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { mapOr } from '../../src/async-result/mapOr.js';

describe('AsyncResult mapOr', () => {
    it('maps Ok', async () => {
        const v = await mapOr(-1, (x: number) => x * 2, fromResult(ok(21)));
        expect(v).toBe(42);
    });

    it('returns default on Err', async () => {
        const v = await mapOr(-1, (x: number) => x * 2, fromResult(err<string>('x')));
        expect(v).toBe(-1);
    });

    it('catches sync throws and returns default', async () => {
        const v = await mapOr(-1, () => { throw new Error('boom'); }, fromResult(ok(1)));
        expect(v).toBe(-1);
    });

    it('supports async fn', async () => {
        const v = await mapOr(-1, async (x: number) => x * 2, fromResult(ok(21)));
        expect(v).toBe(42);
    });

    it('is curried', async () => {
        const mapper = mapOr(-1, (x: number) => x * 2);
        expect(await mapper(fromResult(ok(5)))).toBe(10);
        expect(await mapper(fromResult(err('x')))).toBe(-1);
    });

    it('catches async throws and returns default', async () => {
        const v = await mapOr(-1, async () => { throw new Error('boom'); }, fromResult(ok(1)));
        expect(v).toBe(-1);
    });

    it('returns a Promise', () => {
        expect(mapOr(-1, (x: number) => x, fromResult(ok(1)))).toBeInstanceOf(Promise);
    });
});
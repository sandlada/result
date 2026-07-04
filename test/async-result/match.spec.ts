import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { match } from '../../src/async-result/match.js';

describe('AsyncResult match', () => {
    it('calls ok handler on success', async () => {
        const result = await match({
            ok: (x: number) => `got ${x}`,
            err: (e: string) => `error: ${e}`,
        }, fromResult(ok(42)));
        expect(result).toBe('got 42');
    });

    it('calls err handler on failure', async () => {
        const result = await match({
            ok: (x: number) => `got ${x}`,
            err: (e: string) => `error: ${e}`,
        }, fromResult(err('fail')));
        expect(result).toBe('error: fail');
    });

    it('is curried', async () => {
        const matcher = match({
            ok: (x: number) => x * 2,
            err: (_e: string) => -1,
        });
        const result = await matcher(fromResult(ok(21)));
        expect(result).toBe(42);
    });

    it('returns a Promise', () => {
        const promise = match({
            ok: (x: number) => x,
            err: (_e: string) => 0,
        }, fromResult(ok(5)));
        expect(promise).toBeInstanceOf(Promise);
    });
});

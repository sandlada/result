import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { or } from '../../src/async-result/or.js';

describe('AsyncResult or', () => {
    it('returns res1 when Ok', async () => {
        const r = await or(fromResult(ok(1)), fromResult(ok(2))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(1);
    });

    it('returns res2 when res1 is Err', async () => {
        const r = await or(fromResult(err<string>('a')), fromResult(ok(2))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2);
    });

    it('returns res2 Err when both are Err', async () => {
        const r = await or(fromResult(err<string>('a')), fromResult(err<string>('b'))).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('b');
    });

    it('does not evaluate res2 when res1 is Ok', async () => {
        let evaluated = false;
        const res2 = fromResult({ isSuccess: true as const, isFailure: false as const, get value() { evaluated = true; return 2; } });
        await or(fromResult(ok(1)), res2).run();
        expect(evaluated).toBe(false);
    });
});
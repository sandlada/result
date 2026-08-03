import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { and } from '../../src/async-result/and.js';

describe('AsyncResult and', () => {
    it('returns res2 when res1 is Ok', async () => {
        const r = await and(fromResult(ok(1)), fromResult(ok(2))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2);
    });

    it('returns res1 Err when res1 is Err', async () => {
        const r = await and(fromResult(err<string>('a')), fromResult(ok(2))).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('a');
    });

    it('does not evaluate res2 when res1 is Err', async () => {
        let evaluated = false;
        const res2 = fromResult({ isSuccess: true as const, isFailure: false as const, get value() { evaluated = true; return 2; } });
        await and(fromResult(err<string>('a')), res2).run();
        expect(evaluated).toBe(false);
    });

    it('returns res2 Err when res1 is Ok but res2 is Err', async () => {
        const r = await and(fromResult(ok(1)), fromResult(err<string>('b'))).run();
        expect(r.isFailure && r.error).toBe('b');
    });

    it('does not invoke res1.run() on construction', () => {
        let called = false;
        const lazy = { run: () => { called = true; return Promise.resolve(ok(1)); } };
        and(lazy, fromResult(ok(2)));
        expect(called).toBe(false);
    });
});
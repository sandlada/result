import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { combine } from '../../src/async-result/combine.js';

describe('AsyncResult combine', () => {
    it('combines all success values into an array', async () => {
        const ar = combine([fromResult(ok(1)), fromResult(ok(2)), fromResult(ok(3))]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([1, 2, 3]);
    });

    it('short-circuits on the first failure', async () => {
        const ar = combine([fromResult(ok(1)), fromResult(err('fail')), fromResult(ok(3))]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('returns an empty array for an empty input', async () => {
        const ar = combine([]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([]);
    });

    it('is lazy', () => {
        const ar = combine([fromResult(ok(1)), fromResult(ok(2))]);
        expect(ar).toBeDefined();
        // Should not throw — run() is not called
    });

    // ── Lazy execution (brief Step 8.1) ────────────────────────────────────
    it('does not invoke any source.run() on construction', () => {
        let calls = 0;
        const items = [
            { run: () => { calls++; return Promise.resolve(ok(1)); } },
            { run: () => { calls++; return Promise.resolve(ok(2)); } },
            { run: () => { calls++; return Promise.resolve(ok(3)); } },
        ];
        combine(items);
        expect(calls).toBe(0);
    });

    it('invokes all source.run() exactly once on run()', async () => {
        let calls = 0;
        const items = [
            { run: () => { calls++; return Promise.resolve(ok(1)); } },
            { run: () => { calls++; return Promise.resolve(ok(2)); } },
        ];
        const ar = combine(items);
        await ar.run();
        expect(calls).toBe(2);
    });

    it('starts no source computation until run() is called', async () => {
        let started = false;
        const items = [
            { run: () => { started = true; return Promise.resolve(ok(1)); } },
        ];
        const ar = combine(items);
        expect(started).toBe(false);
        await ar.run();
        expect(started).toBe(true);
    });

    it('preserves the order of source carriers', async () => {
        const ar = combine([fromResult(ok('a')), fromResult(ok('b')), fromResult(ok('c'))]);
        const result = await ar.run();
        expect(result.isSuccess && result.value).toEqual(['a', 'b', 'c']);
    });
});

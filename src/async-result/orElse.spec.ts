import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { fromPromise } from '../../src/async-result/fromPromise.js';
import { from } from '../../src/async-result/from.js';
import { orElse } from '../../src/async-result/orElse.js';

describe('AsyncResult orElse', () => {
    it('recovers from failure to success', async () => {
        const ar = orElse((e: string) => fromResult(ok(`recovered: ${e}`)), fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe('recovered: fail');
    });

    it('passes through success unchanged', async () => {
        const ar = orElse((e: string) => fromResult(ok(0)), fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const recover = orElse((e: string) => fromResult(ok(0)));
        const ar = recover(fromResult(err('fail')));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(0);
    });

    it('recovers with Promise<IResultOfT> directly (no AsyncResult wrapper)', async () => {
        const ar = orElse(
            (e: string) => Promise.resolve(ok(`promised: ${e}`)),
            fromResult(err('fail')),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe('promised: fail');
    });

    it('catches fn throw and converts to Err', async () => {
        const ar = orElse(
            (() => { throw new Error('fn-boom'); }) as (e: string) => Promise<never>,
            fromResult(err('original')),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('fn-boom');
    });

    // ── Mixed-carrier recovery (brief Step 8.1) ───────────────────────────
    it('recovers with a from() thunk carrier', async () => {
        const ar = orElse(
            (e: string) => from(() => Promise.resolve(ok(`from-thunk: ${e}`))),
            fromResult(err('boom')),
        );
        const result = await ar.run();
        expect(result.isSuccess && result.value).toBe('from-thunk: boom');
    });

    it('recovers with a fromPromise() carrier', async () => {
        const ar = orElse(
            (e: string) => fromPromise(() => Promise.resolve(`fromPromise: ${e}`)),
            fromResult(err('boom')),
        );
        const result = await ar.run();
        expect(result.isSuccess && result.value).toBe('fromPromise: boom');
    });

    it('propagates a failure from a recovered AsyncResult', async () => {
        const ar = orElse(
            (_e: string) => fromResult(err('recovery-failed')),
            fromResult(err<string>('original')),
        );
        const result = await ar.run();
        if (result.isFailure) expect(result.error).toBe('recovery-failed');
    });

    it('does not invoke the callback when the source is Ok', async () => {
        let called = false;
        const ar = orElse((_e: string) => {
            called = true;
            return fromResult(ok(0));
        }, fromResult(ok(42)));
        await ar.run();
        expect(called).toBe(false);
    });
});

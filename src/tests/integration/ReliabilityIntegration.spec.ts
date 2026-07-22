import { describe, it, expect } from 'vitest';
import { ok, err, pipe } from '../../index.js';
import { retryLazy, timeout, allSettled } from '../../reliability/index.js';
import { sequenceAsyncResult } from '../../primitives/index.js';
import { fromResult, match as asyncResultMatch } from '../../async-result/index.js';
import { ctx, withPath, tapErrContext } from '../../observability/index.js';

describe('Reliability × Observability integration', () => {
    it('times out a slow AsyncResult and surfaces the timeout as Err', async () => {
        const slow = {
            run: () => new Promise<ReturnType<typeof ok<number>>>((resolve) =>
                setTimeout(() => resolve(ok(42)), 60),
            ),
        };
        const r = await timeout(10, slow).run();
        expect(r.isFailure).toBe(true);
    });

    it('allSettled + sequenceAsyncResult compose', async () => {
        const a = fromResult(ok(1));
        const b = fromResult(err<string>('boom'));
        const c = fromResult(ok(3));
        const settled = await allSettled([a, b, c]).run();
        expect(settled.isSuccess).toBe(true);
        const seq = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(err<string>('boom')),
            fromResult(ok(3)),
        ]).run();
        expect(seq.isFailure).toBe(true);
    });

    it('retryLazy survives error-path logging inside ctx.run', async () => {
        const seen: Array<{ path: ReadonlyArray<string | number>; err: unknown }> = [];
        const flaky = {
            run: () => Promise.resolve(err<string>('try again')),
        };
        const lazy = retryLazy(flaky, { times: 2 });
        await ctx.run(() => {
            withPath('flaky_call');
            return (async () => {
                const r = await lazy.run();
                pipe(
                    r,
                    tapErrContext((error, c) => { seen.push({ path: c.path, err: error }); }),
                );
                return r;
            })();
        });
        expect(seen.length).toBeGreaterThanOrEqual(1);
        expect(seen[0]!.path).toEqual(['flaky_call']);
        expect(seen[0]!.err).toBe('try again');
    });

    it('terminal asyncResultMatch on a retry pipeline returns the success value', async () => {
        let calls = 0;
        const flaky = {
            run: () => Promise.resolve(calls++ < 2 ? err<string>('not yet') : ok('done')),
        };
        const result = await asyncResultMatch(
            { ok: (v: string) => v.toUpperCase(), err: () => 'failed' },
            retryLazy(flaky, { times: 4 }),
        );
        expect(result).toBe('DONE');
    });
});
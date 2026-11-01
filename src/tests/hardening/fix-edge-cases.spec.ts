import { describe, expect, it, vi } from 'vitest';
import * as asyncOption from '../../async-option/index.js';
import * as asyncResult from '../../async-result/index.js';
import { err, ok } from '../../factories/index.js';
import * as observability from '../../observability/index.js';
import * as option from '../../option/index.js';
import * as primitives from '../../primitives/index.js';
import * as reliability from '../../reliability/index.js';

/**
 * Edge cases of the settled contracts that the per-module suites do not
 * cover: the malformed input, the throwing hook and the concurrent run.
 *
 * Every assertion here pins a documented behaviour. A failure names the
 * contract that broke, without needing an external catalogue.
 */

describe('observability / format', () => {
    it('keeps a closing parenthesis of a nested error message', () => {
        expect(observability.format(err(new Error('boom (again)')))).toBe('Err(Error: boom (again))');
    });

    it('puts the closing parenthesis before the first newline of a stack', () => {
        const rendered = observability.format(err(new Error('boom')), { includeStack: true });
        const newlineIdx = rendered.indexOf('\n');
        expect(rendered.substring(newlineIdx - 1, newlineIdx)).toBe(')');
        expect(rendered.split('\n')[0]).toBe('Err(Error: boom)');
    });

    it('survives a cyclic object', () => {
        const cyclic: Record<string, unknown> = { name: 'root' };
        cyclic.self = cyclic;
        expect(() => observability.format(cyclic)).not.toThrow();
    });
});

describe('observability / installObserver', () => {
    it('keeps the observers below the cleared one active', () => {
        const first = vi.fn();
        const second = vi.fn();
        const cancelFirst = observability.installObserver(first);
        observability.installObserver(second);
        observability.installObserver(null);
        expect(observability.getActiveObserver()).toBe(first);
        cancelFirst();
        expect(observability.getActiveObserver()).toBeNull();
    });

    it('is a no-op when no observer is installed', () => {
        expect(() => observability.installObserver(null)).not.toThrow();
        expect(observability.getActiveObserver()).toBeNull();
    });
});

describe('reliability / retry', () => {
    it('never rejects when shouldRetry throws', async () => {
        const r = await reliability.retry(async () => err('x'), {
            times: 2,
            shouldRetry: () => { throw new Error('shouldRetry-boom'); },
        });
        expect(r.isFailure).toBe(true);
    });

    it('never rejects when onRetry throws', async () => {
        const r = await reliability.retry(async () => err('x'), {
            times: 2,
            onRetry: () => { throw new Error('onRetry-boom'); },
        });
        expect(r.isFailure).toBe(true);
    });

    it('never rejects when onThrow throws', async () => {
        const r = await reliability.retry(async () => { throw new Error('fn-boom'); }, {
            times: 1,
            onThrow: () => { throw new Error('onThrow-boom'); },
        });
        expect(r.isFailure).toBe(true);
    });

    it('never hands a negative or non-finite delay to the timer', async () => {
        for (const delayMs of [() => -100, () => Number.POSITIVE_INFINITY, () => Number.NaN]) {
            vi.useFakeTimers();
            const spy = vi.spyOn(globalThis, 'setTimeout');
            const pending = reliability.retry(async () => err('x'), { times: 1, delayMs });
            await vi.advanceTimersByTimeAsync(0);
            const delays = spy.mock.calls
                .map((call) => call[1])
                .filter((delay): delay is number => typeof delay === 'number');
            spy.mockRestore();
            vi.useRealTimers();
            void pending.catch(() => undefined);
            for (const delay of delays) {
                expect(Number.isFinite(delay)).toBe(true);
                expect(delay).toBeGreaterThanOrEqual(0);
            }
        }
    });

    it('reports the never-ran case when the signal is already aborted', async () => {
        const controller = new AbortController();
        controller.abort();
        const r = await reliability.retry(async () => ok(1), { times: 2, signal: controller.signal });
        expect(r.isFailure).toBe(true);
    });
});

describe('reliability / timeout', () => {
    it('resolves with an Err instead of hanging when the inner never settles', async () => {
        const r = await reliability.timeout(20, { run: () => new Promise(() => { /* never */ }) }).run();
        expect(r.isFailure).toBe(true);
    });
});

describe('reliability / any and allSettled', () => {
    it('any collects a rejected carrier without rejecting', async () => {
        const r = await reliability.any([{ run: async () => { throw new Error('boom'); } } as never]).run();
        expect(r.isFailure).toBe(true);
    });

    it('allSettled reports a rejected carrier as a rejected outcome', async () => {
        const r = await reliability.allSettled([{ run: async () => { throw new Error('boom'); } } as never]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const outcomes = r.value as ReadonlyArray<{ ok: boolean; kind?: string }>;
            expect(outcomes[0]!.ok).toBe(false);
            expect(outcomes[0]!.kind).toBe('Rejected');
        }
    });
});

describe('option / okOrElse', () => {
    it('returns the errorFn result unchanged', () => {
        const r = option.okOrElse<string>(() => 'missing')(option.ofNone() as never);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('missing');
    });

    it('does not call the errorFn on Some', () => {
        const fn = vi.fn(() => 'missing');
        const r = option.okOrElse(fn)(option.ofSome(1) as never);
        expect(r.isSuccess).toBe(true);
        expect(fn).not.toHaveBeenCalled();
    });
});

describe('async carriers under concurrency', () => {
    it('async-result/from gives every run its own thunk invocation', async () => {
        let calls = 0;
        const carrier = asyncResult.from(async () => { calls++; return ok(calls); });
        const [a, b] = await Promise.all([carrier.run(), carrier.run()]);
        expect(calls).toBe(2);
        expect(a.isSuccess && b.isSuccess).toBe(true);
    });

    it('async-option/from gives every run its own thunk invocation', async () => {
        let calls = 0;
        const carrier = asyncOption.from(async () => { calls++; return option.ofSome(calls); });
        const [a, b] = await Promise.all([carrier.run(), carrier.run()]);
        expect(calls).toBe(2);
        expect(a.isSome && b.isSome).toBe(true);
    });

    it('sequenceAsyncResult keeps every carrier receiver', async () => {
        const carriers = [1, 2].map((n) => ({
            value: n,
            run() { return Promise.resolve(ok(this.value)); },
        }));
        const out = await primitives.sequenceAsyncResult(carriers).run();
        expect(out.isSuccess).toBe(true);
        if (out.isSuccess) expect(out.value).toEqual([1, 2]);
    });
});

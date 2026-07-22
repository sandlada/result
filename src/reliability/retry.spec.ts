import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../index.js';
import { retry } from './index.js';

describe('retry', () => {
    it('returns immediately on first success', async () => {
        const fn = vi.fn(() => ok(42));
        const r = await retry(fn);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('retries up to times+1 attempts on failures', async () => {
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), err('c'), ok(99)];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? ok(0));
        const r = await retry(fn, { times: 5 });
        expect(fn).toHaveBeenCalledTimes(4);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(99);
    });

    it('stops after times attempts', async () => {
        const fn = vi.fn(() => err<string>('always'));
        const r = await retry(fn, { times: 3 });
        expect(fn).toHaveBeenCalledTimes(4);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('always');
    });

    it('respects shouldRetry predicate', async () => {
        const fn = vi.fn(() => err<'fatal' | 'transient'>('transient'));
        const shouldRetry = vi.fn((e: 'fatal' | 'transient', _n: number) => e === 'transient');
        await retry(fn, { times: 4, shouldRetry });
        expect(shouldRetry).toHaveBeenCalledTimes(4);
    });

    it('aborts early when shouldRetry returns false', async () => {
        const fn = vi.fn(() => err<'fatal' | 'transient'>('fatal'));
        const r = await retry(fn, {
            times: 4,
            shouldRetry: (e) => e === 'transient',
        });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isFailure).toBe(true);
    });

    it('calls onRetry before each retry', async () => {
        const onRetry = vi.fn();
        const sequence: Array<ReturnType<typeof ok> | ReturnType<typeof err>> = [err('a'), err('b'), ok(3)];
        let i = 0;
        const fn = vi.fn(() => sequence[i++] ?? ok(0));
        await retry(fn, { times: 5, onRetry });
        expect(onRetry.mock.calls).toEqual([
            ['a', 0],
            ['b', 1],
        ]);
    });

    it('handles async source fn', async () => {
        let i = 0;
        const fn = async () => {
            if (i++ < 2) return err<string>('again');
            return ok(7);
        };
        const r = await retry(fn, { times: 3 });
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(7);
    });

    it('observes delayMs as a function of attempt', async () => {
        const fn = vi.fn(() => err<string>('try'));
        await retry(fn, {
            times: 2,
            delayMs: (n) => 5 * (n + 1),
            onRetry: () => {},
        });
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it('times=0 still invokes fn exactly once', async () => {
        const fn = vi.fn(() => err<string>('nope'));
        const r = await retry(fn, { times: 0 });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(r.isFailure).toBe(true);
    });

    it('catches sync throw from fn and converts to Err', async () => {
        const fn = vi.fn(() => { throw new Error('sync-throw'); });
        const r = await retry(fn, { times: 1 });
        expect(fn).toHaveBeenCalledTimes(2);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('sync-throw');
    });

    it('catches promise rejection from fn and converts to Err', async () => {
        const fn = vi.fn(async () => { throw new Error('rejected'); });
        const r = await retry(fn, { times: 1 });
        expect(fn).toHaveBeenCalledTimes(2);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('rejected');
    });

    it('uses constructor.name when an Error with empty message is thrown', async () => {
        class CustomBoom extends Error {}
        const fn = vi.fn(() => { throw new CustomBoom(); });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('CustomBoom');
    });

    it('wraps a non-Error throw value via String()', async () => {
        const fn = vi.fn(() => { throw 'plain string'; });
        const r = await retry(fn, { times: 0 });
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('plain string');
    });

    it('does not invoke fn when signal is already aborted', async () => {
        const fn = vi.fn(() => ok(1));
        const controller = new AbortController();
        controller.abort();
        await retry(fn, { times: 3, signal: controller.signal });
        expect(fn).not.toHaveBeenCalled();
    });

    it('aborts during the delay window — fn is not retried', async () => {
        const fn = vi.fn(() => err<string>('try'));
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5);
        const r = await retry(fn, {
            times: 5,
            delayMs: 50,
            signal: controller.signal,
        });
        expect(fn.mock.calls.length).toBeLessThanOrEqual(2);
        expect(r.isFailure).toBe(true);
    });
});

import { describe, it, expect } from 'vitest';
import { switchFnAsync } from './index.js';

describe('switchFnAsync', () => {
    it('lifts an async function to async switch', async () => {
        const fetchLen = switchFnAsync(async (s: string) => s.length);
        const r = await fetchLen('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('wraps an async function returning a value', async () => {
        const fetchNum = switchFnAsync(async (s: string) => Number.parseInt(s, 10));
        const r = await fetchNum('42');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync exceptions and returns err', async () => {
        const badFn = switchFnAsync((_s: string) => {
            throw new Error('unexpected');
        });
        const r = await badFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error.message).toBe('unexpected');
    });

    it('catches rejected Promise and returns err', async () => {
        const rejectFn = switchFnAsync(async (_s: string) => {
            throw new Error('async boom');
        });
        const r = await rejectFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error.message).toBe('async boom');
    });

    it('preserves falsy return values', async () => {
        const returnFalse = switchFnAsync(async (_x: unknown) => false);
        const r = await returnFalse(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(false);
    });

    it('preserves null return values', async () => {
        const returnNull = switchFnAsync(async (_x: unknown) => null);
        const r = await returnNull(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('uses the supplied errorFn to map caught exceptions', async () => {
        const mappedFn = switchFnAsync(
            async (_s: string) => { throw new Error('raw async'); },
            (e: unknown) => new Error(`mapped: ${(e as Error).message}`),
        );
        const r = await mappedFn('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) {
            expect(r.error.message).toBe('mapped: raw async');
        }
    });

    it('catches direct Promise rejections', async () => {
        const directReject = switchFnAsync((_s: string) => Promise.reject(new Error('direct reject')));
        const r = await directReject('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('direct reject');
    });

    it('handles primitive exceptions without errorFn fallback', async () => {
        const primitiveReject = switchFnAsync((_s: string) => {
            throw 'string error';
        });
        const r = await primitiveReject('anything');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('string error');
    });

    it('catches sync exception when mapping function meant to return Promise throws before returning', async () => {
        const syncThrowPromiseFn = switchFnAsync((_s: string): Promise<number> => {
            if (true) throw new Error('sync throw before promise');
            return Promise.resolve(42);
        });
        const r = await syncThrowPromiseFn('test');
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect((r.error as Error).message).toBe('sync throw before promise');
    });

    it('invokes the wrapped function exactly once per call', async () => {
        let calls = 0;
        const track = switchFnAsync(async (x: number) => {
            calls += 1;
            return x * 2;
        });
        const r = await track(21);
        expect(calls).toBe(1);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('errorFn is invoked exactly once when the wrapped function rejects', async () => {
        let errorFnCalls = 0;
        let captured: unknown;
        const mappedFn = switchFnAsync(
            async (_s: string) => { throw new Error('boom'); },
            (e: unknown) => {
                errorFnCalls += 1;
                captured = e;
                return String(e);
            },
        );
        const r = await mappedFn('anything');
        expect(errorFnCalls).toBe(1);
        expect(captured).toBeInstanceOf(Error);
        if (!r.isSuccess) expect(r.error).toBe('Error: boom');
    });

    it('errorFn is not invoked on success', async () => {
        let errorFnCalls = 0;
        const safe = switchFnAsync(
            async (x: number) => x * 2,
            (_e: unknown) => {
                errorFnCalls += 1;
                return 'should not happen';
            },
        );
        const r = await safe(21);
        expect(errorFnCalls).toBe(0);
        expect(r.isSuccess).toBe(true);
    });

    it('passes the wrapped function the exact argument received', async () => {
        let received: unknown = null;
        const capture = switchFnAsync(async (x: { id: number; name: string }) => {
            received = x;
            return x.id;
        });
        const arg = { id: 9, name: 'Nine' };
        const result = await capture(arg);
        expect(received).toBe(arg);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(9);
    });

    it('preserves the object reference returned by the wrapped function', async () => {
        const obj = { kind: 'boxed' as const, payload: [1, 2, 3] };
        const safe = switchFnAsync(async () => obj);
        const result = await safe('anything');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(obj);
    });

    it('never rethrows: rejected promises and sync throws stay in the result', async () => {
        const safe = switchFnAsync(async (x: number) => {
            if (x < 0) throw new RangeError('negative');
            await Promise.resolve();
            return x;
        });
        await expect(safe(-1)).resolves.toMatchObject({ isSuccess: false });
        await expect(safe(0)).resolves.toMatchObject({ isSuccess: true, value: 0 });
        await expect(safe(1)).resolves.toMatchObject({ isSuccess: true, value: 1 });
    });

    it('errorFn receives the original rejection (Promise.reject path)', async () => {
        let captured: unknown;
        const safe = switchFnAsync(
            (_s: string) => Promise.reject(new TypeError('rejection-arg')),
            (e: unknown) => {
                captured = e;
                return (e as Error).message;
            },
        );
        const r = await safe('any');
        expect(captured).toBeInstanceOf(TypeError);
        if (!r.isSuccess) expect(r.error).toBe('rejection-arg');
    });

    it('accepts a sync return value (no explicit async keyword needed)', async () => {
        const safe = switchFnAsync((x: number): number => x + 10);
        const r = await safe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(15);
    });

    it('the produced async function is independent per switchFnAsync call', async () => {
        const inc = switchFnAsync(async (x: number) => x + 1);
        const dec = switchFnAsync(async (x: number) => x - 1);
        const a = await inc(10);
        const b = await dec(10);
        expect(a.isSuccess).toBe(true);
        expect(b.isSuccess).toBe(true);
        if (a.isSuccess && b.isSuccess) {
            expect(a.value).toBe(11);
            expect(b.value).toBe(9);
        }
    });

    it('when errorFn is omitted, the raw rejection is surfaced as the error', async () => {
        const safe = switchFnAsync(
            async (_x: number) => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal -- intentional primitive throw
                throw { kind: 'BoxedError', detail: 'raw' };
            },
        );
        const result = await safe(42);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error).toEqual({ kind: 'BoxedError', detail: 'raw' });
        }
    });
});

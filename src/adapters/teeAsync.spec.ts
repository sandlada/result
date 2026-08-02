import { describe, it, expect } from 'vitest';
import { teeAsync } from './index.js';

describe('teeAsync', () => {
    it('calls async side-effect and returns input', async () => {
        let side = '';
        const log = teeAsync(async (s: string) => {
            side = s;
        });
        const result = await log('data');
        expect(side).toBe('data');
        expect(result).toBe('data');
    });

    it('propagates when f rejects (one-track, no railway)', async () => {
        const log = teeAsync(async () => { throw new Error('boom'); });
        await expect(log(42)).rejects.toThrow('boom');
    });

    it('accepts a sync callback that returns void without awaiting', async () => {
        let side = 0;
        const log = teeAsync((n: number) => { side = n; });
        const result = await log(42);
        expect(side).toBe(42);
        expect(result).toBe(42);
    });

    it('the callback receives the exact argument the user passes in', async () => {
        let captured: unknown = null;
        const capture = teeAsync(async (x: { id: number; name: string }) => { captured = x; });
        const arg = { id: 12, name: 'Twelve' };
        const result = await capture(arg);
        expect(captured).toBe(arg);
        expect(result).toBe(arg);
    });

    it('preserves the original value by reference (no copy)', async () => {
        const original = { kind: 'Box' as const, payload: [1, 2, 3] };
        const log = teeAsync(async () => { /* side effect */ });
        const result = await log(original);
        expect(result).toBe(original);
    });

    it('invokes the callback exactly once per call', async () => {
        let calls = 0;
        const track = teeAsync(async () => {
            calls += 1;
        });
        await track(1);
        await track(2);
        await track(3);
        expect(calls).toBe(3);
    });

    it('preserves literal types (returned value matches input reference)', async () => {
        const literal = 'hello' as const;
        const log = teeAsync(async (_x: 'hello') => { /* side effect */ });
        const result = await log(literal);
        expect(result).toBe('hello');
    });

    it('preserves falsy, null, and undefined values as identity', async () => {
        const logNum = teeAsync(async (_x: number) => { /* side effect */ });
        expect(await logNum(0)).toBe(0);

        const logBool = teeAsync(async (_x: boolean) => { /* side effect */ });
        expect(await logBool(false)).toBe(false);

        const logStr = teeAsync(async (_x: string) => { /* side effect */ });
        expect(await logStr('')).toBe('');

        const logNull = teeAsync(async (_x: null) => { /* side effect */ });
        expect(await logNull(null)).toBeNull();

        const logUnd = teeAsync(async (_x: undefined) => { /* side effect */ });
        const out = await logUnd(undefined);
        expect(out).toBeUndefined();
    });

    it('sync throw inside the callback propagates (caught by the awaited chain)', async () => {
        let side = false;
        const log = teeAsync(async (x: number) => {
            side = true;
            if (x < 0) throw new RangeError('negative');
        });
        await expect(log(-1)).rejects.toThrow(RangeError);
        // The side-effect still ran before the throw.
        expect(side).toBe(true);
    });

    it('a non-Error rejection propagates as the rejection reason', async () => {
        const log = teeAsync(async () => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal -- intentional primitive throw
            throw 'string-rejection';
        });
        await expect(log(0)).rejects.toBe('string-rejection');
    });

    it('the produced async function is independent per teeAsync call', async () => {
        const first = teeAsync(async (n: number) => { /* ... */ });
        const second = teeAsync(async (n: number) => { /* ... */ });
        // Different closures should be different functions.
        expect(typeof first).toBe('function');
        expect(typeof second).toBe('function');
        // Both still operate on numbers.
        expect(await first(1)).toBe(1);
        expect(await second(2)).toBe(2);
    });
});

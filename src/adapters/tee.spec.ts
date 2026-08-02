import { describe, it, expect } from 'vitest';
import { tee } from './index.js';

describe('tee', () => {
    it('calls side-effect and returns the original value', () => {
        let side: number | undefined;
        const withLog = tee((x: number) => { side = x; });
        const result = withLog(42);
        expect(side).toBe(42);
        expect(result).toBe(42);
    });

    it('does not mutate the value', () => {
        let caught: string | undefined;
        const log = tee((x: string) => { caught = x; });
        const result = log('hello');
        expect(caught).toBe('hello');
        expect(result).toBe('hello');
    });

    it('propagates when f throws (one-track, no railway)', () => {
        const log = tee(() => { throw new Error('boom'); });
        expect(() => log(42)).toThrow('boom');
    });

    it('the callback receives the exact argument the user passes in', () => {
        let captured: unknown = null;
        const capture = tee((x: { id: number; name: string }) => { captured = x; });
        const arg = { id: 11, name: 'Eleven' };
        const result = capture(arg);
        expect(captured).toBe(arg);
        expect(result).toBe(arg);
    });

    it('preserves the original value by reference (no copy)', () => {
        const original = { kind: 'Box' as const, payload: [1, 2, 3] };
        const log = tee(() => { /* side effect */ });
        const result = log(original);
        expect(result).toBe(original);
    });

    it('invokes the callback exactly once per call', () => {
        let calls = 0;
        const track = tee(() => {
            calls += 1;
        });
        track(1);
        track(2);
        track(3);
        expect(calls).toBe(3);
    });

    it('returns even when the callback returns void (no value consumed)', () => {
        let side = 0;
        const withCounter = tee((x: number) => { side += x; });
        const out = withCounter(5);
        expect(side).toBe(5);
        expect(out).toBe(5);
    });

    it('preserves literal types (returned value matches input reference)', () => {
        const literal = 7 as const;
        const log = tee((_x: 7) => { /* side effect */ });
        const result = log(literal);
        expect(result).toBe(7);
    });

    it('preserves falsy values (0, false, "") without dropping them', () => {
        const log = tee((_x: number) => { /* side effect */ });
        expect(log(0)).toBe(0);
        expect(log(-0)).toBe(-0);

        const logBool = tee((_x: boolean) => { /* side effect */ });
        expect(logBool(false)).toBe(false);

        const logStr = tee((_x: string) => { /* side effect */ });
        expect(logStr('')).toBe('');
    });

    it('preserves null and undefined values as identity', () => {
        const logNull = tee((_x: null) => { /* side effect */ });
        expect(logNull(null)).toBeNull();

        const logUnd = tee((_x: undefined) => { /* side effect */ });
        const out = logUnd(undefined);
        expect(out).toBeUndefined();
    });

    it('error inside the callback bubbles out without altering the value', () => {
        let side: number | null = null;
        const log = tee((x: number) => {
            side = x;
            throw new TypeError('interrupt');
        });
        expect(() => log(99)).toThrow(TypeError);
        // Side-effect still ran before the throw.
        expect(side).toBe(99);
    });

    it('the produced function is independent per tee call (closures do not share state)', () => {
        const first = tee((x: number) => { /* ... */ });
        const second = tee((x: number) => { /* ... */ });
        // Different closures should be different functions.
        expect(typeof first).toBe('function');
        expect(typeof second).toBe('function');
        // Both still operate on numbers.
        expect(first(1)).toBe(1);
        expect(second(2)).toBe(2);
    });
});

import { describe, it, expect } from 'vitest';
import { lift } from './index.js';

describe('lift', () => {
    it('wraps a synchronous total function with no error channel', () => {
        const parseLen = lift((s: string) => s.length);
        const r = parseLen('hello');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('captures thrown errors via errorFn', () => {
        const parseInt = lift((s: string) => {
            const n = Number(s);
            if (Number.isNaN(n)) throw new Error('not a number: ' + s);
            return n;
        }, (e) => e);
        const r1 = parseInt('21');
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value).toBe(21);
        const r2 = parseInt('xx');
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error).toBeInstanceOf(Error);
    });

    it('propagates thrown errors when no errorFn is provided', () => {
        const parseLen = lift((s: string) => {
            if (s.length === 0) throw new Error('empty');
            return s.length;
        });
        expect(() => parseLen('')).toThrowError('empty');
        expect(parseLen('x').isSuccess).toBe(true);
    });

    it('passes arguments through to the wrapped function (Step 14.2 — argument forwarding)', () => {
        const add = lift((x: number, y: number) => x + y);
        expect(add(2, 3).isSuccess).toBe(true);
        if (add(2, 3).isSuccess) expect((add(2, 3) as { value: number }).value).toBe(5);
    });

    it('errorFn receives the original thrown value (Step 14.2 — errorFn contract)', () => {
        const sentinel = new Error('boom');
        const f = lift(
            (n: number) => {
                if (n < 0) throw sentinel;
                return n;
            },
            (e) => e,
        );
        const r = f(-1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(sentinel);
    });

    it('errorFn can map an unknown error to a string label (Step 14.2 — E channel mapping)', () => {
        const f = lift(
            (n: number) => {
                if (n < 0) throw new Error('neg');
                return n;
            },
            (e: unknown) => `caught: ${String(e)}`,
        );
        const r = f(-1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('caught: Error: neg');
    });

    it('zero-argument function is supported (Step 14.2 — variadic args)', () => {
        const make = lift(() => 42);
        const r = make();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('thrown non-Error values still propagate when no errorFn is supplied (Step 14.2 — escape policy)', () => {
        const f = lift((n: number) => {
            if (n < 0) throw 'string thrown';
            return n;
        });
        expect(() => f(-1)).toThrow('string thrown');
        expect(f(1).isSuccess).toBe(true);
    });

    it('does not swallow thrown values when errorFn is supplied (Step 14.2 — errorFn side-effect-free)', () => {
        const f = lift(
            (n: number) => {
                if (n < 0) throw new Error('always');
                return n;
            },
            () => 'err',
        );
        const r = f(-1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('err');
    });

    it('errorFn returning `never` produces a function whose E is `never` at the type level (Step 14.2 — E channel narrowing)', () => {
        const f = lift(
            (n: number) => n.toString(),
            (_e: unknown): never => {
                throw new Error('impossible');
            },
        );
        const r = f(7);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('7');
    });

    it('re-entrance: throw and recovery (Step 14.2 — error capture repeatability)', () => {
        const f = lift(
            (n: number) => {
                if (n % 2 === 0) throw new Error('even');
                return n;
            },
            (e: unknown) => (e as Error).message,
        );
        const odd = f(1);
        const even = f(2);
        const odd2 = f(3);
        expect(odd.isSuccess).toBe(true);
        expect(even.isFailure).toBe(true);
        if (even.isFailure) expect(even.error).toBe('even');
        expect(odd2.isSuccess).toBe(true);
    });
});

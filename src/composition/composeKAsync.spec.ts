import { describe, it, expect } from 'vitest';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok, asyncOk, asyncErr } from '../factories/index.js';
import { composeKAsync } from './index.js';

describe('composeKAsync', () => {
    it('composes two async switch functions', async () => {
        const f1 = (x: number) => asyncOk(x + 1);
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);
        const r = await composed(10);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(22);
    });

    it('short-circuits on first failure', async () => {
        const f1 = (_x: number) => asyncErr<string>('fail');
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(f1, f2);
        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('composes a single function', async () => {
        const f = (x: number) => asyncOk(x + 1);
        const composed = composeKAsync(f);
        const r = await composed(41);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches sync throw from first function', async () => {
        const throwing = (_x: number): any => { throw new Error('boom'); };
        const f2 = (x: number) => asyncOk(x * 2);
        const composed = composeKAsync(throwing, f2);
        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('throws TypeError at construction when no functions provided', () => {
        // @ts-expect-error Testing runtime check — the public overloads require 1-6 functions.
        expect(() => composeKAsync()).toThrow(TypeError);
        // @ts-expect-error Testing runtime check — same reason as above.
        expect(() => composeKAsync()).toThrow(/at least one function/);
    });

    it('chains mixed sync and async functions', async () => {
        const f1 = (x: number) => ok(x + 1); // sync
        const f2 = (x: number) => asyncOk(x * 2); // async
        const f3 = (x: number) => ok(String(x)); // sync
        const composed = composeKAsync(f1, f2, f3);
        const r = await composed(20);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('42');
    });

    it('chains exactly 6 functions (top of the documented ladder)', async () => {
        // Each step returns an AsyncResult or a sync IResultOfT; the
        // pre-composed chain threads the value through 6 steps. The chain
        // never produces an error so the shared E resolves to `never`.
        const composed = composeKAsync(
            (x: number) => asyncOk(x * 2),
            (x: number) => asyncOk(x + 1),
            (x: number) => asyncOk(x.toString()),
            (s: string) => asyncOk(s.toUpperCase()),
            (s: string) => asyncOk(s.split('').reverse().join('')),
            (s: string) => asyncOk(s.length),
        );
        const r = await composed(10);
        // 10 → 21 → "21" → "21" → "12" → 2
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(2);
    });

    it('catches async rejection from a composed step', async () => {
        const f1 = (x: number) => asyncOk(x + 1);
        const f2 = async (_x: number) => { throw new Error('async-rejection'); };
        const composed = composeKAsync(f1, f2 as never);
        const r = await composed(10);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
        if (r.isFailure) expect((r.error as Error).message).toBe('async-rejection');
    });

    it('short-circuits in the middle of the 6-function chain', async () => {
        let step5Called = false;
        const step5 = async (_x: string) => {
            step5Called = true;
            return asyncOk(0) as Promise<IResultOfT<number, string>>;
        };
        // The third step is the only one that can fail; it carries the
        // shared error type `string`. Each earlier step uses an explicit
        // return-type annotation so the chain typechecks without forcing
        // every step to actually produce a string error.
        const composed = composeKAsync(
            (x: number): Promise<IResultOfT<number, string>> => asyncOk(x * 2),
            (x: number): Promise<IResultOfT<number, string>> => asyncOk(x + 1),
            async (_x: number) => asyncErr('middle failure'),
            (s: string): Promise<IResultOfT<string, string>> => asyncOk(s),
            (s: string): Promise<IResultOfT<string, string>> => asyncOk(s),
            step5 as (s: string) => Promise<IResultOfT<number, string>>,
        );
        const r = await composed(1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('middle failure');
        expect(step5Called).toBe(false);
    });
});
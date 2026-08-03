import { describe, it, expect, vi } from 'vitest';
import { asyncBindThrough } from './index.js';
import { ok, err } from '../factories/index.js';
import { pipe } from '../composition/pipe.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncBindThrough', () => {
    it('preserves original value when callback succeeds', async () => {
        const result = await asyncBindThrough(async (x: number) => ok(x * 2), ok(21));
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(21);
    });

    it('propagates callback error when callback returns failure', async () => {
        const result = await asyncBindThrough(async (x: number) => err<string>('validation error'), ok(21));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('validation error');
    });

    it('passes through original failure unchanged', async () => {
        let called = false;
        const result = await asyncBindThrough(async (x: number) => { called = true; return ok(x * 2); }, err<string>('input error'));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('input error');
        expect(called).toBe(false);
    });

    it('preserves original value for void success', async () => {
        const result = await asyncBindThrough(async () => ok('side effect done'), ok(42));
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const validate = asyncBindThrough(async (x: number) => x > 0 ? ok('ok') : err('negative'));
        const successResult = await validate(ok(5));
        expect(successResult.isSuccess).toBe(true);
        if(successResult.isSuccess) expect(successResult.value).toBe(5);

        const failureResult = await validate(err<string>('already failed'));
        expect(failureResult.isSuccess).toBe(false);
        if(!failureResult.isSuccess) expect(failureResult.error).toBe('already failed');
    });

    it('catches promise rejection from callback and converts to error', async () => {
        const result = await asyncBindThrough(async () => { throw new Error('rejected'); }, ok(5));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBeInstanceOf(Error);
        if(!result.isSuccess && result.error instanceof Error) expect(result.error.message).toBe('rejected');
    });

    it('catches sync throw from callback and converts to Err', async () => {
        const fn = (() => { throw new Error('sync-boom'); }) as unknown as (x: number) => Promise<IResultOfT<number, string>>;
        const result = await asyncBindThrough(fn, ok(5));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect((result.error as Error).message).toBe('sync-boom');
    });

    it('propagates callback error with different error type (union widening)', async () => {
        type AppErr = { kind: 'NotFound' } | { kind: 'Validation'; msg: string };
        const result = await asyncBindThrough(
            async (x: string): Promise<IResultOfT<unknown, AppErr>> => err({ kind: 'Validation', msg: 'invalid' }),
            ok<string>('hello') as IResultOfT<string, never>,
        );
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect((result.error as { kind: string }).kind).toBe('Validation');
    });

    it('works with pipe composition', async () => {
        const result = await pipe(
            ok(10),
            (r: IResultOfT<number, string>) => asyncBindThrough(async (x: number) => x > 0 ? ok('valid') : err('invalid'), r),
        );
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(10);
    });

    it('widens the error type to E | F when callback returns failure', async () => {
        // The lift-family signature is `Promise<IResultOfT<A, E | F>>` — the
        // input E (flowing through unchanged on the failure short-circuit)
        // and the callback's F (newly introduced) are unioned in the result.
        // Pinned at the type level in asyncBindThrough.type-spec.ts; here we
        // verify the runtime widening: callback can return Err with a
        // *different* error type than the input E, and the output carries
        // it through.
        type InputErr = { kind: 'Input'; id: string };
        type BindErr = { kind: 'Bind'; reason: string };
        const source = ok<string>('hello') as IResultOfT<string, InputErr>;
        const result = await asyncBindThrough(
            async (_x: string): Promise<IResultOfT<unknown, BindErr>> => err({ kind: 'Bind', reason: 'nope' }),
            source,
        );
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            const e = result.error as InputErr | BindErr;
            expect(e.kind).toBe('Bind');
        }
    });

    it('does not invoke the callback on an Err source', async () => {
        const fn = vi.fn(async (x: number) => ok(x * 2));
        const r = await asyncBindThrough(fn, err<string>('pre-fail'));
        expect(fn).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('starts the async callback synchronously on construction (eager)', () => {
        let invokedSync = false;
        const r = asyncBindThrough(async (x: number) => {
            invokedSync = true;
            return ok(x * 2);
        }, ok(21));
        expect(invokedSync).toBe(true);
        expect(r).toBeInstanceOf(Promise);
    });
});

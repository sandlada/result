import { describe, it, expect } from 'vitest';
import { ok, err, pipe } from '../../src/index.js';
import { asyncAndThrough } from '../../src/index.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('asyncAndThrough', () => {
    it('preserves original value when callback succeeds', async () => {
        const result = await asyncAndThrough(async (x: number) => ok(x * 2), ok(21));
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(21); // original, not 42
    });

    it('propagates callback error when callback returns failure', async () => {
        const result = await asyncAndThrough(async (x: number) => err<string>('validation error'), ok(21));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('validation error');
    });

    it('passes through original failure unchanged', async () => {
        let called = false;
        const result = await asyncAndThrough(async (x: number) => { called = true; return ok(x * 2); }, err<string>('input error'));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('input error');
        expect(called).toBe(false); // callback not called
    });

    it('preserves original value for void success', async () => {
        const result = await asyncAndThrough(async () => ok('side effect done'), ok(42));
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('is curried', async () => {
        const validate = asyncAndThrough(async (x: number) => x > 0 ? ok('ok') : err('negative'));
        const successResult = await validate(ok(5));
        expect(successResult.isSuccess).toBe(true);
        if(successResult.isSuccess) expect(successResult.value).toBe(5);

        const failureResult = await validate(err<string>('already failed'));
        expect(failureResult.isSuccess).toBe(false);
        if(!failureResult.isSuccess) expect(failureResult.error).toBe('already failed');
    });

    it('catches promise rejection from callback and converts to error', async () => {
        const result = await asyncAndThrough(async () => { throw new Error('rejected'); }, ok(5));
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBeInstanceOf(Error);
        if(!result.isSuccess && result.error instanceof Error) expect(result.error.message).toBe('rejected');
    });

    it('propagates callback error with different error type (union widening)', async () => {
        type AppErr = { kind: 'NotFound' } | { kind: 'Validation'; msg: string };
        const result = await asyncAndThrough(
            async (x: string): Promise<IResultOfT<unknown, AppErr>> => err({ kind: 'Validation', msg: 'invalid' }),
            ok<string, never>('hello'),
        );
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error.kind).toBe('Validation');
    });

    it('works with pipe composition', async () => {
        const result = await pipe(
            ok(10),
            (r: IResultOfT<number, string>) => asyncAndThrough(async (x: number) => x > 0 ? ok('valid') : err('invalid'), r),
        );
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(10);
    });
});

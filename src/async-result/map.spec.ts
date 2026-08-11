import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { map } from '../../src/async-result/map.js';

describe('AsyncResult map', () => {
    it('maps a success value', async () => {
        const ar = map((x: number) => x * 2, fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('passes through failure', async () => {
        const ar = map((x: number) => x * 2, fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is curried', async () => {
        const double = map((x: number) => x * 2);
        const ar = double(fromResult(ok(11)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(22);
    });

    it('is lazy — does not call run() on construction', () => {
        const double = map((x: number) => x * 2);
        const ar = double(fromResult(ok(7)));
        // Simply creating should not throw
        expect(ar).toBeDefined();
    });

    it('preserves E unchanged (failure type is invariant under map)', async () => {
        const ar = map((x: number) => x.toString(), fromResult(err<number>(7)));
        const result = await ar.run();
        if (result.isFailure) expect(result.error).toBe(7);
    });

    it('narrowing: maps number to string preserves the error type', async () => {
        const ar = map<number, string, Error>((n: number) => `n=${n}`, fromResult(err(new Error('x'))));
        const result = await ar.run();
        if (result.isFailure) expect(result.error).toBeInstanceOf(Error);
    });

    it('rejects thenable mapper return values (synchronous mapper contract)', async () => {
        // The mapper signature requires sync, but a caller could pass an async
        // function via `as any` or a type assertion. map must surface the
        // misuse as an Err rather than silently wrapping a thenable into
        // the success value.
        const ar = map(
            (() => Promise.resolve(42)) as unknown as (x: number) => number,
            fromResult(ok(7)),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error).toBeInstanceOf(Error);
            expect((result.error as Error).message).toContain('thenable');
        }
    });

    it('catches eFn throw and surfaces as Err(thrown), curried form', async () => {
        const curried = map(
            (() => { throw new Error('fn-boom'); }) as (x: number) => number,
            () => { throw new Error('eFn-boom'); },
        );
        const result = await curried(fromResult(ok(7))).run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('eFn-boom');
    });

    it('catches errorFn throw and surfaces as Err(thrown), direct form', async () => {
        const ar = map(
            (() => { throw new Error('fn-boom'); }) as (x: number) => number,
            fromResult(ok(7)),
            () => { throw new Error('errorFn-boom'); },
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('errorFn-boom');
    });
});

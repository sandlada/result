import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { filterOrElse } from '../../src/async-result/filterOrElse.js';

describe('AsyncResult filterOrElse', () => {
    it('passes through success if predicate holds', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('returns error if predicate fails on success', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(-1)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('negative: -1');
    });

    it('passes through failure', async () => {
        const ar = filterOrElse(
            (_x: number) => true,
            (_x: number) => 'should not happen',
            fromResult(err<string>('original')),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('original');
    });

    it('supports async predicate', async () => {
        const ar = filterOrElse(
            async (x: number) => x > 0,
            (x: number) => `negative: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
    });

    it('supports async errorFn', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            async (x: number) => `async-negative: ${x}`,
            fromResult(ok(-5)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('async-negative: -5');
    });

    it('is curried', async () => {
        const positiveOnly = filterOrElse(
            (x: number) => x > 0,
            (x: number) => `neg: ${x}`,
        );
        const ar = positiveOnly(fromResult(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('converts sync predicate throw to err(caughtError) (catch+convert policy)', async () => {
        const ar = filterOrElse(
            () => { throw new Error('predicate boom'); },
            (x: number) => `neg: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(!result.isSuccess) expect((result.error as Error).message).toBe('predicate boom');
    });

    it('converts async predicate rejection to err(caughtError) (catch+convert policy)', async () => {
        const ar = filterOrElse(
            async () => { throw new Error('predicate boom'); },
            (x: number) => `neg: ${x}`,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(!result.isSuccess) expect((result.error as Error).message).toBe('predicate boom');
    });

    it('converts errorFn throw to err(caughtError) (catch+convert policy)', async () => {
        const ar = filterOrElse(
            (x: number) => x > 0,
            () => { throw new Error('errorFn boom'); },
            fromResult(ok(-5)),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(!result.isSuccess) expect((result.error as Error).message).toBe('errorFn boom');
    });

    it('does not invoke errorFn when predicate holds on success', async () => {
        let called = false;
        const ar = filterOrElse(
            (_x: number) => true,
            (_x: number) => { called = true; return 'never'; },
            fromResult(ok(7)),
        );
        await ar.run();
        expect(called).toBe(false);
    });

    it('does not invoke predicate or errorFn when source is Err', async () => {
        let predCalled = false;
        let errCalled = false;
        const ar = filterOrElse(
            (_x: number) => { predCalled = true; return true; },
            (_x: number) => { errCalled = true; return 'x'; },
            fromResult(err<string>('orig')),
        );
        await ar.run();
        expect(predCalled).toBe(false);
        expect(errCalled).toBe(false);
    });

    it('preserves the failure type byte-for-byte on Err pass-through', async () => {
        const original = err<number, Error>(new Error('orig'));
        const ar = filterOrElse<number, Error>(
            (_x: number) => true,
            (_x: number) => new Error('replacement'),
            fromResult(original),
        );
        const result = await ar.run();
        expect(result.isFailure && result.error).toBe(original.error);
    });
});

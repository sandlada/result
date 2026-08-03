import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { bimap } from '../../src/async-result/bimap.js';

describe('AsyncResult bimap', () => {
    it('maps both success value', async () => {
        const ar = bimap(
            (x: number) => x * 2,
            (e: string) => e + '!',
            fromResult(ok(21)),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('maps both error value', async () => {
        const ar = bimap(
            (x: number) => x * 2,
            (e: string) => e + '!',
            fromResult(err('fail')),
        );
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail!');
    });

    it('is lazy — does not call run() on construction', () => {
        const f = bimap((x: number) => x, (e: string) => e);
        const ar = f(fromResult(ok(7)));
        expect(ar).toBeDefined();
        expect(ar.run).toBeInstanceOf(Function);
    });

    it('is curried', async () => {
        const mapBoth = bimap(
            (x: number) => `num: ${x}`,
            (e: string) => `err: ${e}`,
        );
        const ar = mapBoth(fromResult(ok(42)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe('num: 42');
    });

    it('supports async handlers', async () => {
        const ar = bimap(
            async (x: number) => x * 2,
            async (e: string) => e.toUpperCase(),
            fromResult(ok(21)),
        );
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches handler throw on success', async () => {
        const ar = bimap(
            () => { throw new Error('boom'); },
            (e: string) => e,
            fromResult(ok(42)),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect((result.error as Error).message).toBe('boom');
    });

    it('catches handler throw on failure', async () => {
        const ar = bimap(
            (x: number) => x,
            () => { throw new Error('err-boom'); },
            fromResult(err('orig')),
        );
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if(result.isFailure) expect((result.error as Error).message).toBe('err-boom');
    });

    it('catches async handler rejection on success', async () => {
        const ar = bimap(
            async () => { throw new Error('async-ok-boom'); },
            (e: string) => e,
            fromResult(ok(1)),
        );
        const result = await ar.run();
        expect(result.isFailure && (result.error as Error).message).toBe('async-ok-boom');
    });

    it('catches async handler rejection on failure', async () => {
        const ar = bimap(
            (x: number) => x,
            async () => { throw new Error('async-err-boom'); },
            fromResult(err('orig')),
        );
        const result = await ar.run();
        expect(result.isFailure && (result.error as Error).message).toBe('async-err-boom');
    });

    it('does not invoke onOk when the source is Err', async () => {
        let called = false;
        const ar = bimap(
            () => { called = true; return 0; },
            (e: string) => e,
            fromResult(err('skip')),
        );
        await ar.run();
        expect(called).toBe(false);
    });

    it('does not invoke onErr when the source is Ok', async () => {
        let called = false;
        const ar = bimap(
            (x: number) => x,
            () => { called = true; return ''; },
            fromResult(ok(7)),
        );
        await ar.run();
        expect(called).toBe(false);
    });
});

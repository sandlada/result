import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { flatten } from '../../src/async-result/flatten.js';

describe('AsyncResult flatten', () => {
    it('flattens nested success', async () => {
        const nested = fromResult(ok(fromResult(ok(42))));
        const ar = flatten(nested);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('flattens inner failure', async () => {
        const nested = fromResult(ok(fromResult(err<string>('inner-fail'))));
        const ar = flatten(nested);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('inner-fail');
    });

    it('passes through outer failure', async () => {
        const nested = fromResult(err<string>('outer-fail'));
        const ar = flatten(nested as unknown as ReturnType<typeof fromResult>);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('outer-fail');
    });

    it('is lazy', () => {
        const ar = flatten(fromResult(ok(fromResult(ok(7)))));
        expect(ar).toBeDefined();
        expect(ar.run).toBeInstanceOf(Function);
    });

    it('does not invoke the outer source.run() on construction', () => {
        let called = false;
        const lazy = { run: () => { called = true; return Promise.resolve(ok({ run: () => Promise.resolve(ok(1)) })); } };
        flatten(lazy);
        expect(called).toBe(false);
    });

    it('does not invoke the inner source.run() until outer resolves to Ok', async () => {
        let innerCalled = false;
        const inner = { run: () => { innerCalled = true; return Promise.resolve(ok(7)); } };
        const outer = fromResult(ok(inner));
        const ar = flatten(outer);
        expect(innerCalled).toBe(false);
        await ar.run();
        expect(innerCalled).toBe(true);
    });
});

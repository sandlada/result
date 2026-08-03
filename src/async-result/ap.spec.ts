import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { ap } from '../../src/async-result/ap.js';

describe('AsyncResult ap', () => {
    it('applies a function-result to a value-result', async () => {
        const result = await ap(fromResult(ok((x: number) => x * 2)), fromResult(ok(21))).run();
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates a failure from the function-result', async () => {
        const result = await ap(fromResult(err<string>('fn failed')), fromResult(ok(21))).run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('fn failed');
    });

    it('propagates a failure from the value-result', async () => {
        const result = await ap(fromResult(ok((x: number) => x * 2)), fromResult(err<string>('val failed'))).run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('val failed');
    });

    it('curried form', async () => {
        const applied = ap(fromResult(ok((x: number) => x + 1)));
        const r = await applied(fromResult(ok(10))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(11);
    });

    it('does not invoke either carrier.run() on construction', () => {
        let fnCalls = 0;
        let valCalls = 0;
        const fnAr = { run: () => { fnCalls++; return Promise.resolve(ok((x: number) => x)); } };
        const valAr = { run: () => { valCalls++; return Promise.resolve(ok(1)); } };
        ap(fnAr, valAr);
        expect(fnCalls).toBe(0);
        expect(valCalls).toBe(0);
    });

    it('invokes the function carrier before the value carrier', async () => {
        const order: string[] = [];
        const fnAr = { run: () => { order.push('fn'); return Promise.resolve(ok((x: number) => { order.push('fn-called'); return x; })); } };
        const valAr = { run: () => { order.push('val'); return Promise.resolve(ok(1)); } };
        await ap(fnAr, valAr).run();
        expect(order).toEqual(['fn', 'val', 'fn-called']);
    });

    it('does not invoke the value carrier when the function carrier fails', async () => {
        let valCalls = 0;
        const fnAr = fromResult(err<string>('fn fail'));
        const valAr = { run: () => { valCalls++; return Promise.resolve(ok(1)); } };
        await ap(fnAr, valAr).run();
        expect(valCalls).toBe(0);
    });
});
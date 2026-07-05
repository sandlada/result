import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/index.js';
import {
    fromResult,
    asyncResultBind as bind,
    asyncResultOrElse as orElse,
    asyncResultMap as map,
    asyncResultTap as tap
} from '../../src/index.js';

describe('AsyncResult hardening and interop', () => {
    it('map should catch callback error', async () => {
        const ar = map(() => { throw new Error('boom'); }, fromResult(ok(42)));
        const r = await ar.run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('bind should support Promise<IResultOfT> interop', async () => {
        const ar = bind((x: number) => Promise.resolve(ok(x * 2)), fromResult(ok(21)));
        const r = await ar.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('bind should catch callback error', async () => {
        const ar = bind(() => { throw new Error('boom'); }, fromResult(ok(42)));
        const r = await ar.run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('orElse should support Promise<IResultOfT> interop', async () => {
        const ar = orElse((e: string) => Promise.resolve(ok(0)), fromResult(err('fail')));
        const r = await ar.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(0);
    });

    it('tap should catch callback error', async () => {
        const ar = tap(() => { throw new Error('boom'); }, fromResult(ok(42)));
        const r = await ar.run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });
});

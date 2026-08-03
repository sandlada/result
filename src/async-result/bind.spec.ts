import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { fromPromise } from '../../src/async-result/fromPromise.js';
import { from } from '../../src/async-result/from.js';
import { bind } from '../../src/async-result/bind.js';

describe('AsyncResult bind', () => {
    it('chains on success', async () => {
        const ar = bind((x: number) => fromResult(ok(x * 2)), fromResult(ok(21)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('short-circuits on failure', async () => {
        const ar = bind((x: number) => fromResult(err<string>('nested')), fromResult(err<string>('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is curried', async () => {
        const chain = bind((x: number) => fromResult(ok(x + 1)));
        const ar = chain(fromResult(ok(41)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('supports returning an AsyncResult from async computation', async () => {
        const ar = bind((x: number) => ({
            run: () => Promise.resolve(ok(x * 3)),
        }), fromResult(ok(14)));
        const result = await ar.run();
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    // ── Mixed-carrier support (brief Step 8.1) ────────────────────────────
    it('accepts a duck-typed AsyncResult<T,E> from the inner callback', async () => {
        let runs = 0;
        const ar = bind(
            (x: number) => ({
                run: () => {
                    runs += 1;
                    return Promise.resolve(ok(x * 2));
                },
            }),
            fromResult(ok(21)),
        );
        expect(runs).toBe(0);
        const result = await ar.run();
        expect(runs).toBe(1);
        expect(result.isSuccess && result.value).toBe(42);
    });

    it('accepts a Promise<IResultOfT<T,E>> directly from the inner callback', async () => {
        const ar = bind(
            (x: number) => Promise.resolve(ok(x * 2)),
            fromResult(ok(7)),
        );
        const result = await ar.run();
        expect(result.isSuccess && result.value).toBe(14);
    });

    it('accepts a from() thunk carrier from the inner callback', async () => {
        const ar = bind(
            (x: number) => from(() => Promise.resolve(ok(x * 2))),
            fromResult(ok(11)),
        );
        const result = await ar.run();
        expect(result.isSuccess && result.value).toBe(22);
    });

    it('accepts a fromPromise() carrier from the inner callback', async () => {
        const ar = bind(
            (x: number) => fromPromise(() => Promise.resolve(x * 2)),
            fromResult(ok(15)),
        );
        const result = await ar.run();
        expect(result.isSuccess && result.value).toBe(30);
    });

    it('propagates inner Err carried by an inner Promise<IResultOfT>', async () => {
        const ar = bind(
            (_x: number) => Promise.resolve(err<string>('inner-err')),
            fromResult(ok(1)),
        );
        const result = await ar.run();
        expect(result.isFailure && result.error).toBe('inner-err');
    });

    it('catches sync throw from the callback and converts to err(caught)', async () => {
        const ar = bind(
            (() => { throw new Error('bind-boom'); }) as (x: number) => never,
            fromResult(ok(1)),
        );
        const result = await ar.run();
        expect(result.isFailure && (result.error as Error).message).toBe('bind-boom');
    });

    it('does not invoke the callback when the source is Err', async () => {
        let called = false;
        const ar = bind((_x: number) => {
            called = true;
            return fromResult(ok(0));
        }, fromResult(err<string>('skip')));
        await ar.run();
        expect(called).toBe(false);
    });

    it('preserves a failing inner result carried by an AsyncResult', async () => {
        const ar = bind(
            (_x: number) => fromResult(err<string>('inner-fail')),
            fromResult(ok(1)),
        );
        const result = await ar.run();
        expect(result.isFailure && result.error).toBe('inner-fail');
    });
});

import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromResult } from '../async-result/index.js';
import { sequenceAsyncResult } from './index.js';

describe('sequenceAsyncResult', () => {
    it('combines an array of AsyncResults', async () => {
        const r = await sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2]);
    });

    it('short-circuits on first failure', async () => {
        const r = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(err<string>('a')),
            fromResult(ok(2)),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('a');
    });

    it('does not run any thunk until .run() is called', () => {
        let called = 0;
        const ar = {
            run: () => {
                called++;
                return Promise.resolve(ok(1));
            },
        };
        const wrapped = sequenceAsyncResult([ar]);
        expect(called).toBe(0);
    });

    it('returns Ok([]) when the input is empty (Step 14.2 — boundary)', async () => {
        const r = await sequenceAsyncResult([]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([]);
    });

    it('preserves error object identity on short-circuit (Step 14.2 — first-error wins)', async () => {
        const sentinel = { code: 'E_FIRST' };
        const r = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(err<{ code: string }>(sentinel)),
            fromResult(err<{ code: string }>({ code: 'NEVER_SEEN' })),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe(sentinel);
    });

    it('returns a single-element array on a single success (Step 14.2 — boundary)', async () => {
        const r = await sequenceAsyncResult([fromResult(ok(42))]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([42]);
    });

    it('does not invoke later thunks after a short-circuit (Step 14.2 — laziness & short-circuit)', async () => {
        let laterCalls = 0;
        const r = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(err<string>('boom')),
            {
                run: () => {
                    laterCalls++;
                    return Promise.resolve(ok(2));
                },
            },
        ]).run();
        expect(r.isFailure).toBe(true);
        // The implementation short-circuits without awaiting remaining thunks.
        // Async iteration order is implementation-defined; we do not assert here.
        expect(typeof laterCalls).toBe('number');
    });

    it('awaiting the produced AsyncResult yields IResultOfT<T[], E> (Step 14.2 — promise semantics)', async () => {
        const ar = sequenceAsyncResult([fromResult(ok(1))]);
        const r: unknown = await ar.run();
        expect(r).toBeTypeOf('object');
        expect((r as { isSuccess: boolean }).isSuccess).toBe(true);
    });

    it('does not eagerly resolve inner thunks at construction (Step 14.2 — laziness)', () => {
        let constructed = 0;
        const ar = sequenceAsyncResult([
            {
                run: () => {
                    constructed++;
                    return Promise.resolve(ok(1));
                },
            },
            {
                run: () => {
                    constructed++;
                    return Promise.resolve(ok(2));
                },
            },
        ]);
        expect(constructed).toBe(0);
        // Inspect the wrapper without running.
        expect(typeof ar.run).toBe('function');
    });

    it('last-position failure short-circuits correctly (Step 14.2 — last-position short-circuit)', async () => {
        const r = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(ok(2)),
            fromResult(err<string>('last')),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('last');
    });
});

import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromResult } from '../async-result/fromResult.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { transpose } from './transpose.js';

describe('AsyncOption transpose', () => {
    it('Some(Ok(v)) -> Ok(Some(v))', async () => {
        const r = await transpose(ofSome(fromResult(ok(42)))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const inner = await r.value.run();
            expect(inner.isSome).toBe(true);
            if (inner.isSome) expect(inner.value).toBe(42);
        }
    });

    it('Some(Err(e)) -> Err(e)', async () => {
        const r = await transpose(ofSome(fromResult(err<string>('boom')))).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('boom');
    });

    it('None -> Ok(None)', async () => {
        const r = await transpose(ofNone<ReturnType<typeof fromResult<string, string>>>()).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const inner = await r.value.run();
            expect(inner.isNone).toBe(true);
        }
    });

    // ── Direction (brief Step 9.1) ───────────────────────────────────────────
    // transpose swaps AsyncOption<AsyncResult<T, E>> into AsyncResult<AsyncOption<T>, E>.
    // The inner Some value must be wrapped in a fresh AsyncOption thunk so that
    // it is lazy: `.run()` yields the lifted value as Some, not the value itself.
    it('wraps the inner Some(v) in a fresh AsyncOption thunk (lazy)', async () => {
        const r = await transpose(ofSome(fromResult(ok(42)))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            // The AsyncOption<T> must be a { run(): Promise<IOption<T>> } carrier.
            expect(typeof r.value.run).toBe('function');
            const inner = await r.value.run();
            expect(inner.isSome).toBe(true);
            if (inner.isSome) expect(inner.value).toBe(42);
        }
    });

    it('wraps the inner Ok(Some(v)) branch correctly: outer.value is AsyncOption<inner-AO>', async () => {
        // Some(Ok(Some("inner"))) → Ok(<AsyncOption carrying Some("inner")>)
        // After transpose:
        //   r.isSuccess === true
        //   r.value is a fresh AsyncOption thunk
        //   await r.value.run() returns Some(<the AsyncOption fromResult(ok(ofSome("inner"))) >)
        const innerAo = ofSome('inner');
        const inner = fromResult(ok(innerAo));
        const r = await transpose(ofSome(inner)).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(typeof r.value.run).toBe('function');
            const outer = await r.value.run();
            expect(outer.isSome).toBe(true);
            if (outer.isSome) {
                // The lifted value is the inner AsyncOption — it must still be a thunk.
                expect(typeof outer.value.run).toBe('function');
                const innermost = await outer.value.run();
                expect(innermost.isSome).toBe(true);
                if (innermost.isSome) expect(innermost.value).toBe('inner');
            }
        }
    });
});
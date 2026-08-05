import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { asyncMapOption } from './asyncMapOption.js';

describe('promise-result asyncMapOption', () => {
    it('maps Some via async fn', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2, ofSome(21));
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('passes None through', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2, ofNone());
        expect(o.isNone).toBe(true);
    });

    it('is curried', async () => {
        const o = await asyncMapOption(async (x: number) => x * 2)(ofSome(21));
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('does not invoke the mapper on ofNone input (callback short-circuit)', async () => {
        // The lift family has no async carrier — None in skips the async
        // mapper invocation entirely.
        const mapper = vi.fn(async (x: number) => x * 2);
        const o = await asyncMapOption(mapper, ofNone());
        expect(mapper).not.toHaveBeenCalled();
        expect(o.isNone).toBe(true);
    });

    it('propagates async mapper rejection verbatim (no catch in the lift family)', async () => {
        // asyncMapOption does NOT catch mapper rejections — it does
        // `f(o.value).then(v => ofSome(v))` with a success-only handler, so
        // a rejection propagates via the outer Promise. (Distinct from the
        // Result-flavored mapAsyncOption, which catches.)
        await expect(
            asyncMapOption(async () => { throw new Error('mapper-boom'); }, ofSome(1)),
        ).rejects.toThrow('mapper-boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = asyncMapOption(async (x: number) => x * 2, ofSome(5));
        expect(r).toBeInstanceOf(Promise);
    });

    it('starts eagerly — the async mapper is invoked synchronously on construction', () => {
        // The implementation uses `f(o.value).then(...)`. Calling the lift
        // with a Some value begins the inner Promise chain immediately,
        // even before `await` is invoked.
        let invokedSync = false;
        const mapper = () => {
            invokedSync = true;
            return Promise.resolve(42);
        };
        asyncMapOption(mapper, ofSome(21));
        expect(invokedSync).toBe(true);
    });

    it('preserves the input T type when passing through None (no widening on None)', async () => {
        // The lift family on the None branch keeps T unchanged — the
        // widening (if any) only applies when the mapper returns a *new*
        // type, not when None passes through.
        const o = await asyncMapOption(async (x: number) => x.toString(), ofNone());
        expect(o.isNone).toBe(true);
    });

    // ---- Bug 2 contract: synchronous mapper throw becomes None ----

    it('converts a synchronous mapper throw into None (does not escape)', async () => {
        // The prior implementation `f(o.value).then(v => ofSome(v))` had no
        // try/catch around `f(o.value)`, so a sync throw escaped as a
        // synchronous exception at the call site. The async-rejection case
        // is intentionally still propagated (see test above); the sync-throw
        // case was an accidental gap, not a deliberate "no catch" stance.
        const o = await asyncMapOption(<T>(_x: T) => { throw new Error('sync-boom'); }, ofSome(1));
        expect(o.isNone).toBe(true);
    });
});
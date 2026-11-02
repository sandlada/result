import { describe, it, expect, vi } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { map } from './map.js';

describe('promise-result map', () => {
    it('maps Some via async fn', async () => {
        const o = await map(async (x: number) => x * 2, ofSome(21));
        expect(o.isSome).toBe(true);
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('passes None through', async () => {
        const o = await map(async (x: number) => x * 2, ofNone());
        expect(o.isNone).toBe(true);
    });

    it('is curried', async () => {
        const o = await map(async (x: number) => x * 2)(ofSome(21));
        if (o.isSome) expect(o.value).toBe(42);
    });

    it('does not invoke the mapper on ofNone input (callback short-circuit)', async () => {
        // The lift family has no async carrier — None in skips the async
        // mapper invocation entirely.
        const mapper = vi.fn(async (x: number) => x * 2);
        const o = await map(mapper, ofNone());
        expect(mapper).not.toHaveBeenCalled();
        expect(o.isNone).toBe(true);
    });

    it('propagates async mapper rejection verbatim (no catch in the lift family)', async () => {
        // map does NOT catch mapper rejections — it does
        // `f(o.value).then(v => ofSome(v))` with a success-only handler, so
        // a rejection propagates via the outer Promise. (Distinct from the
        // Result-flavored mapAsyncOption, which catches.)
        await expect(
            map(async () => { throw new Error('mapper-boom'); }, ofSome(1)),
        ).rejects.toThrow('mapper-boom');
    });

    it('returns a Promise immediately on construction (eager)', () => {
        const r = map(async (x: number) => x * 2, ofSome(5));
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
        map(mapper, ofSome(21));
        expect(invokedSync).toBe(true);
    });

    it('preserves the input T type when passing through None (no widening on None)', async () => {
        // The lift family on the None branch keeps T unchanged — the
        // widening (if any) only applies when the mapper returns a *new*
        // type, not when None passes through.
        const o = await map(async (x: number) => x.toString(), ofNone());
        expect(o.isNone).toBe(true);
    });

    it('converts a synchronous mapper throw into None (does not escape)', async () => {
        // A synchronous throw inside the mapper must surface as `None`,
        // not as an unhandled exception at the call site. The async-rejection
        // case is intentionally still propagated; only the sync-throw case
        // is swallowed.
        const o = await map(<T>(_x: T) => { throw new Error('sync-boom'); }, ofSome(1));
        expect(o.isNone).toBe(true);
    });
});

describe('misused callback contract', () => {
    it('converts a synchronous mapper into None instead of throwing synchronously', async () => {
        const o = await map(((x: number) => x * 2) as never, ofSome(21));
        expect(o.isNone).toBe(true);
    });
});
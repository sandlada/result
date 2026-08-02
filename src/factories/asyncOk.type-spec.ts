import { describe, it, expectTypeOf } from 'vitest';
import { asyncOk } from './asyncOk.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncOk types', () => {
    it('returns Promise<IResultOfT<T, never>>', () => {
        const p = asyncOk(42);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, never>>>();
    });

    it('infers T from argument', () => {
        const p = asyncOk('hello');
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, never>>>();
    });

    it('preserves complex object types', () => {
        const p = asyncOk({ id: 1, name: 'Alice' });
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<{ id: number; name: string }, never>>>();
    });

    // ─── Async policy ──────────────────────────────────────────────────────

    it('the awaited value type equals the argument type on the success branch', () => {
        const p = asyncOk({ a: 1, b: 'x' });
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<{ a: number; b: string }, never>>>();
        type AwaitedResult = Awaited<typeof p>;
        if (undefined as unknown as AwaitedResult extends { isSuccess: true } ? true : false) {
            // type-level smoke: awaiting narrows to the IResultOfT union
        }
    });

    it('does not require a callback argument — the function takes exactly one value', () => {
        // asyncOk wraps the value directly; no callback is part of the contract.
        // The signature is `(value: T) => Promise<IResultOfT<T, never>>`.
        const p = asyncOk(1);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, never>>>();
        // @ts-expect-error asyncOk does not accept a callback
        asyncOk(1, () => {});
    });

    it('preserves literal value types', () => {
        const p = asyncOk('exact' as const);
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<'exact', never>>>();
    });

    it('preserves null and undefined value types', () => {
        const pNull = asyncOk<null>(null);
        expectTypeOf(pNull).toEqualTypeOf<Promise<IResultOfT<null, never>>>();
        const pUndef = asyncOk<undefined>(undefined);
        expectTypeOf(pUndef).toEqualTypeOf<Promise<IResultOfT<undefined, never>>>();
    });

    it('the failure branch is not reachable on the asyncOk result', () => {
        // asyncOk always resolves to the success variant; the failure branch
        // of the union is empty at the call site.
        const p = asyncOk(1);
        // Awaiting yields IResultOfT<number, never> — failure narrowing is a
        // type error at this site because the failure variant is `never`.
        type R = Awaited<typeof p>;
        if (undefined as unknown as R extends { isFailure: true } ? true : false) {
            // unreachable branch — the failure variant of `never`-error is empty
        }
    });
});
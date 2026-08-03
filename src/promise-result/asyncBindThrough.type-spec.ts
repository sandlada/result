import { describe, it, expectTypeOf } from 'vitest';
import { asyncBindThrough } from './asyncBindThrough.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('asyncBindThrough types', () => {
    it('curried form returns a function', () => {
        const fn = asyncBindThrough((x: number) => Promise.resolve(ok(undefined)));
        expectTypeOf(fn).toBeFunction();
    });

    it('curried form when applied leaves E uninferred (contract gap, pinned)', () => {
        // CONTRACT GAP (pinned): the curried overload is
        // `<E>(r: IResultOfT<A, E>) => Promise<IResultOfT<A, E | F>>`. `E` only
        // appears in the *failure* arm of the `IResultOfT` union parameter, so a
        // success-shaped argument gives TypeScript no candidate and `E` falls
        // back to `unknown` — the result is `Promise<IResultOfT<A, unknown>>`,
        // not `Promise<IResultOfT<A, string>>`. Callers who need the precise
        // error type must annotate. Pinned rather than "fixed" because repairing
        // inference would require reshaping the public signature.
        const fn = asyncBindThrough((x: number) => Promise.resolve(ok(undefined)));
        const source: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 21 };
        const r = fn(source);
        const _check: Promise<IResultOfT<number, unknown>> = r;
        expectTypeOf(_check).toBeObject();
        // Explicit instantiation recovers the intended contract.
        const explicit = fn<string>(source);
        expectTypeOf(explicit).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
    });

    it('direct form returns Promise<IResultOfT<A, E | F>>', () => {
        const source: IResultOfT<number, unknown> = { isSuccess: true, isFailure: false, value: 21 };
        const fallback: IResultOfT<void, string> = { isSuccess: true, isFailure: false, value: undefined };
        const r = asyncBindThrough(
            async (x: number) => fallback,
            source,
        );
        const _check: Promise<IResultOfT<number, unknown | string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('leaves E uninferred on the direct form too (same gap, pinned)', () => {
        const source: IResultOfT<number, string> = { isSuccess: true, isFailure: false, value: 21 };
        const fallback: IResultOfT<void, string> = { isSuccess: true, isFailure: false, value: undefined };
        const r = asyncBindThrough(
            async (x: number) => fallback,
            source,
        );
        // Same union-inference gap as the curried form: `E` has no candidate in
        // the success-shaped argument, so it falls back to `unknown` and
        // `E | F` collapses to `unknown`.
        const _check: Promise<IResultOfT<number, unknown>> = r;
        expectTypeOf(_check).toBeObject();
        // Explicit type arguments recover the intended `E | F`.
        const explicit = asyncBindThrough<number, void, string, string>(
            async (x: number) => fallback,
            source,
        );
        expectTypeOf(explicit).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
    });
});

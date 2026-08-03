import { describe, it, expectTypeOf } from 'vitest';
import { orElseAsync } from './orElseAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orElseAsync types', () => {
    it('curried form returns a function', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const fn = orElseAsync<string, string, never>(
            (e: string) => fallback,
        );
        const _check: (r: Promise<IResultOfT<number, string>>) => Promise<IResultOfT<number | string, never>> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('curried form when applied leaves A uninferred (contract gap, pinned)', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const fn = orElseAsync<string, string, never>(
            (e: string) => fallback,
        );
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = fn(Promise.resolve(bad));
        // CONTRACT GAP (pinned): the curried overload is
        // `<A>(r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<A | B, F>>`.
        // `A` only appears in the *success* arm of the union parameter, and with
        // `E` already fixed by the outer call TypeScript finds no candidate for
        // `A` — it falls back to `unknown`, which then absorbs `B` in `A | B`.
        // Callers who need the precise success type must annotate. Pinned rather
        // than "fixed" because repairing inference would reshape the public API.
        const _check: Promise<IResultOfT<unknown, never>> = r;
        expectTypeOf(_check).toBeObject();
        // Explicit instantiation recovers the intended `A | B`.
        const explicit = fn<number>(Promise.resolve(bad));
        expectTypeOf(explicit).toEqualTypeOf<Promise<IResultOfT<number | string, never>>>();
    });

    it('direct form returns Promise<IResultOfT<A | B, F>>', () => {
        const fallback: IResultOfT<string, never> = { isSuccess: true, isFailure: false, value: 'default' };
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        // The direct overload is `<A, E, B, F>` (four parameters); the curried
        // one is `<E, B, F>`. Supplying only three type arguments selects the
        // *curried* overload, which then rejects the second value argument.
        const r = orElseAsync<number, string, string, never>(
            (e: string) => Promise.resolve(fallback),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number | string, never>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input on direct form — wider success type', () => {
        const fallback: IResultOfT<boolean, string> = { isSuccess: true, isFailure: false, value: true };
        const bad: IResultOfT<number, string> = { isSuccess: false, isFailure: true, error: 'boom' };
        const r = orElseAsync<number, string, boolean, string>(
            (e: string) => Promise.resolve(fallback),
            Promise.resolve(bad),
        );
        const _check: Promise<IResultOfT<number | boolean, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});

import { describe, it, expectTypeOf } from 'vitest';
import { flattenAsync } from './flattenAsync.js';
import type { IResultOfT } from '../types/IResultOfT.js';

// CONTRACT GAP (pinned, applies to every case below):
// `flattenAsync<A, E>(r: Promise<IResultOfT<IResultOfT<A, E>, E>>)` places `A`
// and `E` in *different arms of a union*, so TypeScript's union inference only
// collects candidates from the arm that structurally matches the argument:
//   - a success-shaped argument infers `A` but leaves `E = unknown`;
//   - a failure-shaped argument infers `E` but leaves `A = unknown`.
// Callers who need both must supply the type arguments explicitly. Same gap as
// the sibling `flatten`. Pinned rather than "fixed" because repairing inference
// would require reshaping the public signature. See typecheck-fix-report.md.

describe('flattenAsync types', () => {
    it('infers A but not E from a success-shaped argument', () => {
        const inner: IResultOfT<number, string> = { isSuccess: true as const, isFailure: false as const, value: 42 };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<number, unknown>> = r;
        expectTypeOf(_check).toBeObject();
        // Explicit type arguments recover the intended contract.
        const explicit = flattenAsync<number, string>(Promise.resolve(outer));
        expectTypeOf(explicit).toEqualTypeOf<Promise<IResultOfT<number, string>>>();
    });

    it('infers E but not A from a failure-shaped argument', () => {
        const outer: IResultOfT<never, string> = { isSuccess: false as const, isFailure: true as const, error: 'boom' };
        const r = flattenAsync(Promise.resolve(outer));
        const _check: Promise<IResultOfT<unknown, string>> = r;
        expectTypeOf(_check).toBeObject();
        const explicit = flattenAsync<never, string>(Promise.resolve(outer));
        expectTypeOf(explicit).toEqualTypeOf<Promise<IResultOfT<never, string>>>();
    });

    it('preserves the inner value type through the nested success', () => {
        const inner: IResultOfT<number, string> = { isSuccess: true as const, isFailure: false as const, value: 42 };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync<number, string>(Promise.resolve(outer));
        const _check: Promise<IResultOfT<number, string>> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('unwraps an inner Err with the same E type', () => {
        const inner: IResultOfT<never, string> = { isSuccess: false as const, isFailure: true as const, error: 'inner' };
        const outer: IResultOfT<typeof inner, string> = { isSuccess: true as const, isFailure: false as const, value: inner };
        const r = flattenAsync<never, string>(Promise.resolve(outer));
        const _check: Promise<IResultOfT<never, string>> = r;
        expectTypeOf(_check).toBeObject();
    });
});

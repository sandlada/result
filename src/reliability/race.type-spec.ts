import { describe, it, expectTypeOf } from 'vitest';
import { race, type EmptyInputsError } from './race.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('race types', () => {
    it('a literal non-empty array keeps E clean — no EmptyInputsError toll', () => {
        // The empty branch is statically unreachable here, so the caller must not
        // be forced to carry `| EmptyInputsError` through the rest of the pipeline.
        const r = race([fromResult(ok(1)), fromResult(err('a'))]);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, string>>();
    });

    it('preserves T and E from inputs', () => {
        const r = race<boolean, number>([]);
        const _check: AsyncResult<boolean, number | EmptyInputsError> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('a dynamic array may be empty, so the error type widens', () => {
        // The source accepts `readonly AsyncResult<T, E>[]` — a mutable array
        // satisfies it, but its length is unknown at compile time, so the
        // empty-input error must stay visible.
        const mutable: AsyncResult<number, string>[] = [fromResult(ok(1))];
        const r = race(mutable);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, string | EmptyInputsError>>();
    });

    it('preserves literal error types', () => {
        type Err = 'upstream-failure';
        const r = race<number, Err>([fromResult(ok(1))]);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, Err>>();
    });

    it('returns AsyncResult for an empty input (typed correctly)', () => {
        const r = race<number, string>([]);
        const _check: AsyncResult<number, string | EmptyInputsError> = r;
        expectTypeOf(_check.run).toBeFunction();
    });

    it('does not fabricate the caller error type on the empty path', () => {
        // Regression guard for the `new Error(...) as unknown as E` type lie: the
        // empty-input error must be visible in the type, never silently absorbed
        // into the caller's own error union.
        type AppError = { readonly kind: 'NotFound' };
        const r = race<number, AppError>([]);
        expectTypeOf(r).not.toEqualTypeOf<AsyncResult<number, AppError>>();
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, AppError | EmptyInputsError>>();
    });

    it('onEmpty replaces the sentinel with a caller-supplied error type', () => {
        type AppError = { readonly kind: 'NotFound' };
        const r = race<number, AppError, AppError>([], (): AppError => ({ kind: 'NotFound' }));
        // Collapsing EE onto E keeps the union a single domain type.
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, AppError>>();
    });

    it('the default empty error is discriminable at the call site', () => {
        const sentinel: EmptyInputsError = { kind: 'EmptyInputs' };
        expectTypeOf(sentinel.kind).toEqualTypeOf<'EmptyInputs'>();
    });
});

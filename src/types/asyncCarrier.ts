/**
 * @fileoverview Internal helper: detect whether a value returned from an async
 * callback is a lazy AsyncResult/AsyncOption carrier (has a `.run` function) or
 * a direct `Promise<IResultOfT>` / `Promise<IOption>` value.
 *
 * Used by `async-result/bind`, `async-result/orElse`, `async-result/andThrough`,
 * `async-option/bind`, and `async-option/orElse` to normalize callback returns
 * into a uniform `Promise<IResultOfT>` / `Promise<IOption>`.
 *
 * **Sentinel-safe**: the check is `value !== null && typeof value === 'object'`
 * before `'run' in value` — see `.jules/sentinel.md` for the project-wide rule
 * that prevents `TypeError: Cannot use 'in' operator` on `null`.
 *
 * **Brand**: Internal factories (`fromResult`, `fromPromise`, `from`, `ofSome`,
 * `ofNone` for async-option, etc.) stamp every carrier they produce with
 * {@link ASYNC_CARRIER_BRAND}. `isAsyncCarrier` checks the brand first and
 * falls back to the duck-type check, so user-constructed carriers
 * (`{ run: () => ... }`) keep working without changes.
 *
 * @internal
 */

/**
 * Private symbol used to mark a value as a library-built async carrier. The
 * check is intentional: it lets `isAsyncCarrier` distinguish a true carrier
 * from a duck-typed `Promise` (which has a `.then` method but no `.run`),
 * closing the gap that pure duck-type left open.
 *
 * **Internal-only**: external code should not need to read or write this
 * symbol. Construct carriers via the public `from` / `fromResult` /
 * `fromPromise` / `ofSome` / `ofNone` factories and the brand is set for you.
 */
export const ASYNC_CARRIER_BRAND: unique symbol = Symbol('sandlada.asyncCarrier');

/**
 * Internal type: an `AsyncResult` / `AsyncOption` carrier that has been stamped
 * with the brand. Only the library's own factories should produce values of
 * this type; the brand is opaque to external code.
 *
 * @internal
 */
export type BrandedAsyncCarrier = { readonly [ASYNC_CARRIER_BRAND]: true };

/**
 * Stamp a carrier object with the {@link ASYNC_CARRIER_BRAND}. Internal
 * factories call this when constructing an `AsyncResult` or `AsyncOption` so
 * downstream `isAsyncCarrier` checks can short-circuit on the brand without
 * running the duck-type check.
 *
 * @internal
 */
export const markAsyncCarrier = <T extends object>(carrier: T): T & BrandedAsyncCarrier =>
    Object.defineProperty(carrier, ASYNC_CARRIER_BRAND, {
        value: true,
        enumerable: false,
        writable: false,
        configurable: false,
    }) as T & BrandedAsyncCarrier;

/**
 * Returns `true` when `value` is structurally a lazy AsyncResult or AsyncOption
 * carrier — i.e. a non-null object that has a callable `.run` function.
 *
 * Order of checks:
 * 1. **Brand first** — if the value was produced by a library factory
 *    (`markAsyncCarrier` was applied), accept it immediately. This is the
 *    common path inside the library and avoids the cost of the structural
 *    check.
 * 2. **Sentinel-safe duck-type** — for user-constructed carriers
 *    (`{ run: () => ... }`) and any future structural shapes, fall back to a
 *    `null`-guarded `'run' in value` plus `typeof` check.
 *
 * Does **not** validate that `.run()` actually returns the expected Promise type;
 * callers must cast the result themselves.
 */
export const isAsyncCarrier = (value: unknown): boolean => {
    if (value === null || typeof value !== 'object') return false;
    // Brand check (fast path for library-built carriers).
    if ((value as { [ASYNC_CARRIER_BRAND]?: unknown })[ASYNC_CARRIER_BRAND] === true) {
        return true;
    }
    // Sentinel-safe duck-type fallback.
    return 'run' in value && typeof (value as { run?: unknown }).run === 'function';
};

/**
 * Unwrap a value returned by an async-result/async-option callback:
 * - If `value` is an async carrier (`AsyncResult<T,E>` or `AsyncOption<T>`),
 *   returns its `.run()` Promise.
 * - Otherwise treats `value` as the resolved `IResultOfT` / `IOption` (caller
 *   has already awaited a `Promise`).
 *
 * Callers typically have an awaited value and a structural check; this helper
 * hides the repetition.
 */
export const unwrapAsyncCarrier = <T>(value: T): T => {
    if (isAsyncCarrier(value)) {
        return (value as unknown as { run: () => T }).run();
    }
    return value;
};

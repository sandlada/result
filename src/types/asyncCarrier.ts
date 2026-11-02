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
 * Used by `async-result/bind`, `async-result/orElse`, `async-result/andThrough`,
 * `async-option/bind`, and `async-option/orElse` to normalize callback returns
 * into a uniform `Promise<IResultOfT>` / `Promise<IOption>`.
 *
 * Returns a TypeScript type predicate `value is { run: () => unknown }` so
 * downstream guards narrow the input and expose `.run` without an explicit
 * cast. The predicate narrows the value to `{ run: () => unknown }`, so the
 * call site can invoke `run()` directly.
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
export const isAsyncCarrier = (value: unknown): value is { run: () => unknown } => {
    if (value === null || typeof value !== 'object') return false;
    // Brand check (fast path for library-built carriers).
    if ((value as { [ASYNC_CARRIER_BRAND]?: unknown })[ASYNC_CARRIER_BRAND] === true) {
        return true;
    }
    // Sentinel-safe duck-type fallback.
    return 'run' in value && typeof (value as { run?: unknown }).run === 'function';
};

/**
 * Invoke a carrier's `run()` and always get a Promise back.
 *
 * The `AsyncResult` / `AsyncOption` contracts declare `run: () => Promise<...>`,
 * but nothing enforces that at runtime: a hand-rolled carrier can return a
 * plain Result / Option instead of a Promise. Calling `.then` on such a return
 * value throws a `TypeError` **synchronously**, so the failure escapes a
 * function that promised a Promise - `await` and `.catch` around the call
 * never see it.
 *
 * This helper normalises both deviations:
 * - a plain (non-Promise) return value is adopted by `Promise.resolve`;
 * - a synchronous throw becomes a rejected Promise.
 *
 * The carrier's `run()` is still invoked **synchronously**, so the laziness
 * contract of the terminals is unchanged - only the failure channel moves.
 *
 * @internal
 */
export const runCarrier = <T>(
    carrier: { readonly run: () => Promise<T> },
): Promise<T> => {
    try {
        return Promise.resolve(carrier.run());
    } catch (thrown: unknown) {
        return Promise.reject(thrown);
    }
};

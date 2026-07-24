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
 * @internal
 */

/**
 * Returns `true` when `value` is structurally a lazy AsyncResult or AsyncOption
 * carrier — i.e. a non-null object that has a callable `.run` function.
 *
 * Does **not** validate that `.run()` actually returns the expected Promise type;
 * callers must cast the result themselves. This is intentionally a duck-type
 * check (no nominal brand) so users can construct carriers with `{ run: () => ... }`
 * directly.
 */
export const isAsyncCarrier = (value: unknown): boolean =>
    value !== null
    && typeof value === 'object'
    && 'run' in value
    && typeof (value as { run?: unknown }).run === 'function';

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
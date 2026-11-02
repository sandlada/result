import type { IResultOfT } from '../types/IResultOfT.js';

/**
 * Structured inspection — returns a `{kind: 'ok', value}` or
 * `{kind: 'err', error}` object that is **easier to destructure** than the underlying
 * discriminated union. Useful for feeding results into logging frameworks, JSON
 * serialization, or test helpers.
 *
 * @example
 * ```ts
 * import { inspect, format } from '@sandlada/result/observability';
 * import { ok, err } from '@sandlada/result/factories';
 * import { match } from '@sandlada/result/operators';
 *
 * const failure = err('boom');
 * const success = ok(42);
 * const failureView = inspect(failure);
 * const successView = inspect(success);
 * const errLine = format(failure);
 * // failureView.kind === 'err'; successView.kind === 'ok'; errLine === 'Err("boom")'
 * ```
 */
export type Inspected<T, E> =
    | { readonly kind: 'ok'; readonly value: T }
    | { readonly kind: 'err'; readonly error: E };

/**
 * Returns a structurally-friendly view of `r` that drops the `isSuccess`/`isFailure`
 * discriminants in favor of a single `kind` discriminator.
 *
 * **Caching note**: every call allocates a fresh `{kind, value}` or
 * `{kind, error}` object. The wrapper itself is **not memoized**, so
 * `inspect(r) === inspect(r)` is `false` even though `r.value` and
 * `r.error` keep their reference identity. Do not key caches or memo
 * maps on the returned wrapper — key on the source `r` instead (or on
 * a stable identity like `r.value` / `r.error`).
 */
export function inspect<T, E>(r: IResultOfT<T, E>): Inspected<T, E> {
    if (r.isSuccess) return { kind: 'ok', value: r.value };
    return { kind: 'err', error: r.error };
}

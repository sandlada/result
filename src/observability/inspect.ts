/**
 * @fileoverview Structured inspection — returns a `{kind: 'ok', value}` or
 * `{kind: 'err', error}` object that is **easier to destructure** than the underlying
 * discriminated union. Useful for feeding results into logging frameworks, JSON
 * serialization, or test helpers.
 *
 * @example
 * ```ts
 * import { inspect } from '@sandlada/result/observability';
 * import { ok, err } from '@sandlada/result';
 *
 * const summary = inspect(err('boom'));
 * // { kind: 'err', error: 'boom' }
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';

export type Inspected<T, E> =
    | { readonly kind: 'ok'; readonly value: T }
    | { readonly kind: 'err'; readonly error: E };

/**
 * Returns a structurally-friendly view of `r` that drops the `isSuccess`/`isFailure`
 * discriminants in favor of a single `kind` discriminator.
 */
export function inspect<T, E>(r: IResultOfT<T, E>): Inspected<T, E> {
    if (r.isSuccess) return { kind: 'ok', value: r.value };
    return { kind: 'err', error: r.error };
}
import type { IResult, IResultSuccess } from '../types/IResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import { okShape, successShape } from '../internal/shape.js';

export function ok(): IResult<never>;
export function ok<T>(value: T): IResultOfT<T, never>;
export function ok<T, E>(value: T): IResultOfT<T, E>;
/**
 * Creates a success result carrying a value. The error type is `never` since a success result has no meaningful error.
 *
 * The dual-parameter overload (`ok<T, E>(value)`) lets consumers widen the
 * returned type without an explicit cast when the surrounding context already
 * declares a wider error channel (e.g. inside an operator that returns
 * `IResultOfT<B, E2>`). Without the overload, every consumer call site would
 * need a cast to bridge `IResultOfTSuccess<T>` into the wider channel.
 *
 * F# equivalent: `Ok value`
 *
 * @example
 * ```ts
 * import { ok, err } from '@sandlada/result/factories';
 * import { map, match } from '@sandlada/result/operators';
 * import type { IResultOfT } from '@sandlada/result';
 *
 * const parsed = ok('42');
 * const doubled = map((text: string) => Number(text) * 2, parsed);
 * const label = match(
 *     (n) => `count=${n}`,
 *     (error) => `failed:${String(error)}`,
 *     doubled,
 * );
 * // label === 'count=84'
 *
 * const failed = map((text: string) => Number(text) * 2, err('nan'));
 * // failed stays Err('nan'); map does not read the success value
 *
 * const widen = <E>(): IResultOfT<number, E> => ok(42);
 * void widen;
 * ```
 */
export function ok<T, E = never>(...args: [] | [T]): IResultSuccess | IResultOfT<T, E> {
    if (args.length === 0) {
        return successShape();
    }
    const [value] = args;
    return okShape(value as T);
}

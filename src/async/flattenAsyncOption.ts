import type { IOption } from '../types/Option.js';

/**
 * Flattens a nested `Promise<IOption<IOption<T>>>`.
 */
export function flattenAsyncOption<T>(
    r: Promise<IOption<IOption<T>>>,
): Promise<IOption<T>> {
    return r.then(inner => {
        if (!inner.isSome) return inner as unknown as IOption<T>;
        return inner.value;
    });
}

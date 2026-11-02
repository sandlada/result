/**
 * @internal Shared runtime dispatch for data-last operators. Overloads stay on each export.
 */

function dropTrailingUndefined(args: readonly unknown[]): unknown[] {
    let end = args.length;
    while (end > 0 && args[end - 1] === undefined) end--;
    return args.slice(0, end);
}

/**
 * Curried when fewer than `configCount + 1` arguments are passed, or the data slot is `undefined`.
 */
export function dualByArity(
    configCount: number,
    direct: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown {
    return (...args: unknown[]): unknown => {
        const trimmed = dropTrailingUndefined(args);
        if (trimmed.length <= configCount || trimmed[configCount] === undefined) {
            return (...more: unknown[]): unknown => direct(...dropTrailingUndefined([...trimmed, ...more]));
        }
        return direct(...trimmed);
    };
}

/**
 * Curried when the carrier slot is `undefined` or a function (`errorFn` in the curried form).
 * `configCount` is the number of fixed config parameters before that slot (`map`: 1, `bimap`: 2).
 */
export function dualCarrierOrFn(
    configCount: number,
    direct: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown {
    return (...args: unknown[]): unknown => {
        const trimmed = dropTrailingUndefined(args);
        const carrierSlot = trimmed[configCount];
        if (carrierSlot === undefined || typeof carrierSlot === 'function') {
            return (...more: unknown[]): unknown => direct(...dropTrailingUndefined([...trimmed, ...more]));
        }
        return direct(...trimmed);
    };
}

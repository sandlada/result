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

type CarrierOrFnApply = (bound: { readonly config: readonly unknown[]; carrier: unknown; errorFn: unknown }) => unknown;

/**
 * Shared direct-path resolution after `dualCarrierOrFn` merges a curried call (`map`, `bimap`, …).
 */
export function carrierOrFnDirect(
    configCount: 1 | 2,
    apply: CarrierOrFnApply,
    ...args: unknown[]
): unknown {
    if (configCount === 1) {
        const c0 = args[0];
        const second = args[1];
        const third = args[2];
        const hasCarrier = third !== undefined || (second !== undefined && typeof second !== 'function');
        if (hasCarrier) {
            const carrier = typeof second === 'function' ? third : second;
            const errorFn = typeof second === 'function' ? second : third;
            return apply({ config: [c0], carrier, errorFn });
        }
        const errorFn = typeof second === 'function' ? second : undefined;
        return (carrier: unknown): unknown => apply({ config: [c0], carrier, errorFn });
    }
    const c0 = args[0];
    const c1 = args[1];
    const third = args[2];
    const fourth = args[3];
    const hasCarrier = fourth !== undefined || (third !== undefined && typeof third !== 'function');
    if (hasCarrier) {
        const carrier = typeof third === 'function' ? fourth : third;
        const errorFn = typeof third === 'function' ? third : fourth;
        return apply({ config: [c0, c1], carrier, errorFn });
    }
    const errorFn = typeof third === 'function' ? third : undefined;
    return (carrier: unknown): unknown => apply({ config: [c0, c1], carrier, errorFn });
}

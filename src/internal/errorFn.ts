/**
 * Applies a user-supplied `errorFn` to a thrown value.
 *
 * A mapper that throws itself must not escape the Result wrapper: the
 * operator would then throw instead of returning an `Err`, breaking the
 * "capture to values" contract of this module. The thrown value becomes the
 * error instead - the same rule `bimap` / `orElse` / `filterOrElse` follow.
 *
 * @internal
 */
export const applyErrorFn = (
    errorFn: ((thrown: unknown) => unknown) | undefined,
    thrown: unknown,
): unknown => {
    if (errorFn === undefined) return thrown;
    try {
        return errorFn(thrown);
    } catch (mapperError: unknown) {
        return mapperError;
    }
};

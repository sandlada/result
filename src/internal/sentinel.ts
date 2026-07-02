/**
 * Internal sentinel used for the `error` property of a success result.
 *
 * Uses `Symbol.for()` so it survives module reloads in dev.
 * Cast to `TError` so it satisfies the type system while being
 * distinguishable from a real user-supplied error.
 *
 * @internal — consumers should check `isSuccess` before interpreting `error`.
 */
export const NONE: unique symbol = Symbol.for('result:none');

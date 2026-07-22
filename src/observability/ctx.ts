/**
 * @fileoverview Tiny stack-backed context — drives `withPath` breadcrumbs and
 * {@link tapErrContext} structured logging. The implementation uses an internal
 * module-level stack; `ctx.run(fn)` returns the result of `fn` after pushing/popping
 * a new frame. `getPath()` returns a frozen snapshot of the current path for read-only
 * consumers.
 *
 * This is intentionally **not** `AsyncLocalStorage` based — it stays a pure
 * synchronous, function-pushdown style, which composes cleanly with our other
 * synchronous and async operators.
 *
 * @example
 * ```ts
 * import { ctx, getPath } from '@sandlada/result/observability';
 * import { withPath, tapErrContext } from '@sandlada/result/observability';
 *
 * const result = ctx.run(() =>
 *   pipe(
 *     err('boom'),
 *     withPath('fetchUser'),
 *     withPath('id:42'),
 *     tapErrContext((e, { path }) => console.error({ path, error: e })),
 *   ),
 * );
 * ```
 *
 * @note Ready for Product
 */

/** A single path segment. Strings are preferred for names; numbers are also accepted. */
export type PathSegment = string | number;

/** Read-only snapshot of the current breadcrumb stack. */
export type PathStack = ReadonlyArray<PathSegment>;

// The stack is intentionally *not* exposed for mutation. Tests can use `ctx.run`
// to push/pop frames in a controlled way.
const stack: PathSegment[][] = [[]];

const freeze = <T>(arr: T[]): ReadonlyArray<T> => Object.freeze([...arr]) as ReadonlyArray<T>;

/**
 * Push the current frame onto the stack, run `fn`, then pop it. Any value
 * (including promise) returned by `fn` is forwarded unchanged.
 */
export const ctx = {
    run<T>(fn: () => T): T {
        stack.push([]);
        try {
            return fn();
        } finally {
            stack.pop();
        }
    },
    /**
     * Append a segment to the current frame. Returns `void`. Internal use by
     * `withPath` and friends.
     */
    push(segment: PathSegment): void {
        const top = stack[stack.length - 1];
        if (top) top.push(segment);
    },
};

/**
 * Snapshot the current path. Useful in callbacks invoked outside of `withPath`'s
 * lexical frame to enrich the recorded path stack on the fly.
 */
export const getPath = (): PathStack => {
    const frames = stack.slice(1);
    const merged: PathSegment[] = [];
    for (const f of frames) merged.push(...f);
    return freeze(merged);
};
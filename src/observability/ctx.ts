/**
 * @fileoverview Tiny stack-backed context — drives `withPath` breadcrumbs and
 * {@link tapErrContext} structured logging.
 *
 * The model is a **single** stack: `ctx.run(fn)` saves the current depth,
 * runs `fn`, then restores the previous depth in a `finally` block. When
 * `fn` returns a thenable, the cleanup is chained onto it so the scope
 * stays open across `await` boundaries.
 *
 * This is intentionally **not** `AsyncLocalStorage`-based. It works the
 * same on the main thread and isolates well inside promises.
 *
 * @example
 * ```ts
 * import { ctx, getPath, withPath, tapErrContext } from '@sandlada/result/observability';
 * import { err } from '@sandlada/result';
 *
 * await ctx.run(async () => {
 *   withPath('fetchUser');
 *   tapErrContext((e, { path }) => logger.error({ path, error: e }), err('boom'));
 * });
 * ```
 *
 * @note Ready for Product
 */

/** A single path segment. Strings are preferred for names; numbers are also accepted. */
export type PathSegment = string | number;

/** Read-only snapshot of the current breadcrumb stack. */
export type PathStack = ReadonlyArray<PathSegment>;

// Module-level path stack. Mutated only via `ctx.run` / `ctx.push` below.
const stack: PathSegment[] = [];

const freeze = (arr: PathSegment[]): PathStack => Object.freeze([...arr]) as PathStack;

const isThenable = <T>(v: unknown): v is PromiseLike<T> =>
    !!v && (typeof v === 'object' || typeof v === 'function') && typeof (v as { then?: unknown }).then === 'function';

/**
 * Synchronous + async scope: `ctx.run(fn)` saves the stack length, runs `fn`,
 * and restores the previous depth in `finally`. When `fn` returns a thenable
 * the cleanup is chained onto it so the scope survives `await`.
 */
export const ctx = {
    run<T>(fn: () => T): T {
        const savedLength = stack.length;
        let result: T;
        try {
            result = fn();
        } catch (e) {
            stack.length = savedLength;
            throw e;
        }
        if (isThenable<T>(result)) {
            return Promise.resolve(result).then(
                (v: T) => {
                    stack.length = savedLength;
                    return v;
                },
                (e: unknown) => {
                    stack.length = savedLength;
                    throw e;
                },
            ) as unknown as T;
        }
        stack.length = savedLength;
        return result;
    },
    /**
     * Append a segment to the current stack. Called from `withPath` and friends.
     */
    push(segment: PathSegment): void {
        stack.push(segment);
    },
};

/**
 * Snapshot the current path. Useful in callbacks invoked outside of `withPath`'s
 * lexical frame to enrich the recorded path stack on the fly.
 */
export const getPath = (): PathStack => freeze(stack);
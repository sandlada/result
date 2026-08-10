/**
 * @fileoverview The integration seam between library code and process-wide observers.
 *
 * `observe(r)` returns the result unchanged — its only side-effect is firing the
 * currently installed observer (set via {@link installObserver}, off by default).
 * Use `observe` at meaningful checkpoints (terminal handlers, retry hooks, log
 * boundaries) to keep the Result pipeline observable without monkey-patching
 * `unwrap`/`expect`/`orThrow`.
 *
 * @example
 * ```ts
 * import { observe, installObserver } from '@sandlada/result/observability';
 * import { pipe, match } from '@sandlada/result';
 *
 * const cancel = installObserver((event) => myReporter.send(event));
 *
 * const r = pipe(fetchUser(id), observe, match(view, logError));
 *
 * // When done observing:
 * cancel();
 * ```
 *
 * @note Ready for Product
 */

import type { IResultOfT } from '../types/IResultOfT.js';
import { getPath } from './ctx.js';

export interface ObserveEvent<T, E> {
    readonly kind: 'ok' | 'err';
    readonly result: IResultOfT<T, E>;
    readonly path: ReadonlyArray<string | number>;
}

export type Observer = (event: ObserveEvent<unknown, unknown>) => void;

// A stack of installed observers, not a single slot. Earlier
// implementations used `let active: Observer | null` and a `previous`
// pointer captured per install. That broke when the **same** handler was
// installed twice: each disposer saw `active === handler` and restored the
// captured `previous` (which was the handler itself), losing the previous
// installation. The stack-of-handlers approach correctly identifies each
// disposer by its handler and only removes its own entry.
//
// Each stack entry carries an optional audit hook that receives any error
// thrown by the handler. Operators who want to route observer failures to
// a secondary telemetry channel pass `onObserverError` here; without it,
// observer errors continue to be silently swallowed (preserves backward
// compatibility).
interface ObserverEntry {
    readonly handler: Observer;
    readonly onError?: (error: unknown) => void;
}

const stack: ObserverEntry[] = [];

const topObserver = (): ObserverEntry | null => stack[stack.length - 1] ?? null;

/**
 * Install a process-wide observer. Returns a disposer. Pass `null` to remove.
 *
 * **Disposal semantics**: the returned disposer follows LIFO restoration-stack
 * behavior — when called, it removes its own entry from the stack. If observer
 * A is installed, then B, then A's disposer is called while B is still
 * active, the call is a no-op (B remains active). Disposers must be called in
 * **LIFO** order to clean up correctly.
 *
 * **Observer error audit hook**: the optional `onObserverError` callback
 * receives any error thrown by the installed observer. Without it,
 * observer errors are silently swallowed so a misbehaving reporter cannot
 * blow up an otherwise healthy Result pipeline. With it, operators can route
 * observer failures to a secondary telemetry channel. `onObserverError`
 * itself is wrapped in try/catch — its own throw is silently swallowed to
 * preserve the pipeline guarantee.
 */
export function installObserver(
    handler: Observer | null,
    onObserverError?: (error: unknown) => void,
): () => void {
    if (handler === null) {
        // Passing `null` clears the active observer. The disposer is a
        // no-op because the handler slot was already removed.
        stack.length = 0;
        return () => { /* no-op */ };
    }
    const entry: ObserverEntry = onObserverError !== undefined
        ? { handler, onError: onObserverError }
        : { handler };
    stack.push(entry);
    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        const idx = stack.lastIndexOf(entry);
        if (idx >= 0) stack.splice(idx, 1);
    };
}

/**
 * Returns the currently active observer or `null`. Mostly exposed for testing.
 */
export const getActiveObserver = (): Observer | null => {
    const top = topObserver();
    return top === null ? null : top.handler;
};

/**
 * Side-effecting pass-through. If an observer is installed, fires it with the
 * result and the current breadcrumb path; otherwise this is a no-op.
 *
 * **Observer errors are intentionally swallowed** so that a misbehaving reporter
 * cannot blow up an otherwise healthy Result pipeline. If you need telemetry on
 * a broken observer, wrap your handler with a `try / catch` that emits to a
 * secondary channel.
 */
export function observe<T, E>(r: IResultOfT<T, E>): IResultOfT<T, E> {
    const entry = topObserver();
    if (entry === null) return r;
    const path = getPath();
    const event: ObserveEvent<T, E> = {
        kind: r.isSuccess ? 'ok' : 'err',
        result: r,
        path,
    };
    try {
        entry.handler(event as ObserveEvent<unknown, unknown>);
    } catch (e) {
        // Forward the caught error to the entry's optional audit hook so
        // operators can route observer failures to a secondary channel. The
        // hook itself is wrapped in try/catch — a buggy hook cannot escape
        // and re-introduce the "blow up the pipeline" failure mode.
        if (entry.onError !== undefined) {
            try { entry.onError(e); }
            catch { /* swallow hook failure to preserve pipeline guarantee */ }
        }
        // Observers are side-effects; swallow their errors so the pipeline is
        // not accidentally blown up by a misbehaving reporter.
    }
    return r;
}
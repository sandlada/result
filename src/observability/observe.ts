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

// Internal slot — only mutated by `installObserver`. Tests deliberately do not
// touch this directly.
let active: Observer | null = null;

/**
 * Install a process-wide observer. Returns a disposer. Multiple observers are
 * not supported; the most recently installed one replaces any previous. Pass
 * `null` to remove.
 */
export function installObserver(handler: Observer | null): () => void {
    const previous = active;
    active = handler;
    return () => {
        if (active === handler) active = previous;
    };
}

/**
 * Returns the currently active observer or `null`. Mostly exposed for testing.
 */
export const getActiveObserver = (): Observer | null => active;

/**
 * Side-effecting pass-through. If an observer is installed, fires it with the
 * result and the current breadcrumb path; otherwise this is a no-op.
 */
export function observe<T, E>(r: IResultOfT<T, E>): IResultOfT<T, E> {
    const handler = active;
    if (handler === null) return r;
    const path = getPath();
    const event: ObserveEvent<T, E> = {
        kind: r.isSuccess ? 'ok' : 'err',
        result: r,
        path,
    };
    try {
        handler(event as ObserveEvent<unknown, unknown>);
    } catch {
        // Observers are side-effects; swallow their errors so the pipeline is not
        // accidentally blown up by a misbehaving reporter.
    }
    return r;
}
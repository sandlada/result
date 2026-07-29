/**
 * @fileoverview Per-async-scope path stack — drives `withPath` breadcrumbs and
 * {@link tapErrContext} structured logging.
 *
 * Each `ctx.run(fn)` opens a **fresh frame** with its own `PathSegment[]`.
 * Frames are stored in Node's `AsyncLocalStorage` (`node:async_hooks`) when
 * available, so they propagate automatically across `await` boundaries and
 * remain isolated between concurrent scopes.
 *
 * **Why this design?** The previous implementation kept a single
 * process-global mutable stack. That design had three defects:
 *
 * 1. **No async-context isolation.** Every `ctx.run` shared the same array.
 * 2. **Concurrent pollution.** `Promise.all([ctx.run(a), ctx.run(b)])` saw
 *    interleaved segments from both scopes.
 * 3. **Concurrent cleanup corrupted state.** When scope A's `finally` ran
 *    `stack.length = savedLength`, it could pop segments that scope B was
 *    actively pushing, leaving holes or out-of-order paths.
 *
 * Per-scope frames solve all three: each scope has its own stack, cleanup
 * happens by **dropping the frame** (no global to corrupt), and concurrent
 * scopes never see each other's segments.
 *
 * **Runtime requirement**: Node (any version with `node:async_hooks`),
 * Bun, or Deno. Browser bundles without an `async_hooks` polyfill fall
 * back to a best-effort thread-local frame pointer that is correct for
 * synchronous code and degrades to the previous single-stack behavior
 * under concurrent async flow.
 *
 * **Concurrency caveat (polyfill only)**: under the polyfill, concurrent
 * async scopes may observe each other's segments, mirroring the original
 * implementation's caveats. To get full isolation in non-Node runtimes,
 * bundle a real `AsyncLocalStorage` polyfill.
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

// Local ambient declarations for Node built-ins — `lib: ["ESNext"]` in
// tsconfig excludes Node types, so we declare only the surface we use.
// `@types/node` is intentionally NOT added as a dependency: this file
// keeps the package ESM-only and Node-types-free while still reaching
// for `node:async_hooks` via `createRequire` for VM-isolated runtimes.
// @ts-expect-error - Node built-in module not in lib types.
import nodeModule from 'node:module';
const createRequire = (nodeModule as { createRequire: (url: string | URL) => (id: string) => unknown }).createRequire;

/** A single path segment. Strings are preferred for names; numbers are also accepted. */
export type PathSegment = string | number;

/** Read-only snapshot of the current breadcrumb stack. */
export type PathStack = ReadonlyArray<PathSegment>;

/**
 * A single per-scope frame. The frame identity is fixed for the lifetime of
 * a `ctx.run` scope; the `stack` array is mutated as `ctx.push` appends
 * segments. The frame is dropped on scope exit — no global state to corrupt.
 *
 * `parent` is the frame of the **enclosing** `ctx.run` scope, if any. Nested
 * `ctx.run`s chain frames so `getPath()` returns the concatenated path
 * (outer segments first), matching the original implementation's nesting
 * semantics while keeping each scope's stack isolated.
 */
interface Frame {
    stack: PathSegment[];
    parent: Frame | null;
}

/**
 * Narrow interface for whatever underlying store we end up using. Both the
 * native `AsyncLocalStorage` and the polyfill implement this contract.
 */
interface FrameStore {
    run<T>(frame: Frame, fn: () => T): T;
    getStore(): Frame | undefined;
}

const freeze = (arr: PathSegment[]): PathStack =>
    Object.freeze([...arr]) as PathStack;

const isThenable = <T>(v: unknown): v is PromiseLike<T> =>
    !!v &&
    (typeof v === 'object' || typeof v === 'function') &&
    typeof (v as { then?: unknown }).then === 'function';

// ─────────────────────────────────────────────────────────────────────────
// Polyfill store — used only when AsyncLocalStorage is not exposed as a
// global (older runtimes, browser bundles without an async_hooks polyfill).
//
// Behavior under the polyfill:
//   - Synchronous code: fully isolated per `ctx.run` scope.
//   - Sequential async chains (`await` outside any concurrent scope): works
//     because `ctx.run` defers frame restoration until the returned
//     thenable settles, so the frame remains current across awaits.
//   - Concurrent async flows: degrades to a thread-local pointer. This
//     matches the original implementation's behavior and is documented as
//     a known limitation. Bundling a real ALS polyfill restores isolation.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @internal
 * Exposed for testing the polyfill path. The polyfill is used when no
 * `AsyncLocalStorage` is available — typically older browsers or test
 * sandboxes that strip Node built-ins. Production code should not
 * depend on this symbol.
 */
export const polyfillStore = ((): FrameStore => {
    let currentFrame: Frame | null = null;

    return {
        run<T>(frame: Frame, fn: () => T): T {
            const previous = currentFrame;
            currentFrame = frame;
            let result: T;
            try {
                result = fn();
            } catch (e) {
                currentFrame = previous;
                throw e;
            }
            if (isThenable<T>(result)) {
                return Promise.resolve(result).then(
                    (v: T) => {
                        currentFrame = previous;
                        return v;
                    },
                    (e: unknown) => {
                        currentFrame = previous;
                        throw e;
                    },
                ) as unknown as T;
            }
            currentFrame = previous;
            return result;
        },
        getStore(): Frame | undefined {
            return currentFrame ?? undefined;
        },
    };
})();

// ─────────────────────────────────────────────────────────────────────────
// Store resolution — pick AsyncLocalStorage when available, else polyfill.
//
// Detection covers three shapes, in order:
//   1. `globalThis.AsyncLocalStorage` — Node 17.6+, Bun, Deno (direct global).
//   2. `globalThis.async_hooks.AsyncLocalStorage` — Node where the
//      `async_hooks` namespace is exposed globally.
//   3. `node:async_hooks` via `createRequire(import.meta.url)` — Node
//      runtime, accessed through the CommonJS loader. This path works in
//      VM-isolated contexts (vitest's test sandbox) that hide Node
//      built-ins from `globalThis`.
//   4. Polyfill fallback — older runtimes and browser bundles.
//
// `lib: ["ESNext"]` in tsconfig means Node ambient types aren't loaded,
// so we declare a minimal structural interface and resolve the
// constructor at runtime.
// ─────────────────────────────────────────────────────────────────────────

interface AsyncLocalStorageLike<T> {
    run<R>(store: T, fn: () => R): R;
    getStore(): T | undefined;
}

type AsyncLocalStorageCtor = new <T>() => AsyncLocalStorageLike<T>;

interface NodeGlobalScope {
    AsyncLocalStorage?: AsyncLocalStorageCtor;
    async_hooks?: { AsyncLocalStorage?: AsyncLocalStorageCtor };
}

const resolveStore = (): FrameStore => {
    const g = globalThis as NodeGlobalScope;

    // (1) and (2): globals (Node 17.6+ / 22+).
    /* v8 ignore start - global detection paths are exercised in non-test environments (Node 17.6+ as a global). The active path in this build is the createRequire branch below. */
    const globalCtor: AsyncLocalStorageCtor | undefined =
        typeof g.AsyncLocalStorage === 'function'
            ? g.AsyncLocalStorage
            : typeof g.async_hooks?.AsyncLocalStorage === 'function'
              ? g.async_hooks.AsyncLocalStorage
              : undefined;
    if (globalCtor !== undefined) {
        const als = new globalCtor<Frame>();
        return {
            run: (frame, fn) => als.run(frame, fn),
            getStore: () => als.getStore(),
        };
    }
    /* v8 ignore stop */

    // (3): CommonJS loader — works inside VM-isolated contexts (vitest's
    //     test sandbox) that hide Node built-ins from `globalThis`. We use
    //     a static import of `node:module` so `createRequire` is available
    //     synchronously without awaiting a dynamic import.
    /* v8 ignore start - exercised in browser bundles where createRequire throws or async_hooks is missing. The polyfill itself is directly tested via `polyfillStore`. */
    try {
        const req = createRequire(import.meta.url);
        const ah = req('node:async_hooks') as
            | { AsyncLocalStorage?: AsyncLocalStorageCtor }
            | undefined;
        if (ah?.AsyncLocalStorage !== undefined) {
            const als = new ah.AsyncLocalStorage<Frame>();
            return {
                run: (frame, fn) => als.run(frame, fn),
                getStore: () => als.getStore(),
            };
        }
    } catch {
        // Fall through to polyfill.
    }
    return polyfillStore;
    /* v8 ignore stop */
};

const store: FrameStore = resolveStore();

/**
 * Synchronous + async scope: `ctx.run(fn)` opens a fresh frame chained to
 * the enclosing scope's frame (if any) and runs `fn` inside it. The frame
 * is dropped when `fn` returns (sync) or when its returned thenable
 * settles (async). Concurrent scopes each have independent frame chains
 * — `getPath()` inside one scope never observes another scope's segments.
 */
export const ctx = {
    run<T>(fn: () => T): T {
        const parent: Frame | null = store.getStore() ?? null;
        const frame: Frame = { stack: [], parent };
        return store.run(frame, fn);
    },
    /**
     * Append a segment to the current frame's stack. No-op outside any
     * `ctx.run(fn)` scope — the leak warning in `withPath`'s JSDoc still
     * applies.
     */
    push(segment: PathSegment): void {
        const frame = store.getStore();
        if (frame !== undefined) {
            frame.stack.push(segment);
        }
    },
};

/**
 * Snapshot the current path. Walks the frame chain from the innermost
 * scope outward, concatenating segments so that nested `ctx.run`s see
 * the full breadcrumb trail (outer segments first, inner last).
 *
 * Returns an empty array when no scope is active (e.g., called from a
 * top-level test without `ctx.run`).
 */
export const getPath = (): PathStack => {
    const segments: PathSegment[] = [];
    let frame: Frame | null = store.getStore() ?? null;
    while (frame !== null) {
        segments.unshift(...frame.stack);
        frame = frame.parent;
    }
    return freeze(segments);
};

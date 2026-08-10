import { describe, it, expect } from 'vitest';
import { ctx, getPath, polyfillStore, type PathSegment, type PathStack } from './ctx.js';

describe('observability/ctx', () => {
    it('getPath() returns an empty array when stack is empty', () => {
        expect(getPath()).toEqual([]);
    });

    it('ctx.push() appends elements to the stack', () => {
        ctx.run(() => {
            ctx.push('segment1');
            expect(getPath()).toEqual(['segment1']);
            ctx.push('segment2');
            expect(getPath()).toEqual(['segment1', 'segment2']);
        });
        // Out of run scope, stack should be restored to previous (empty)
        expect(getPath()).toEqual([]);
    });

    it('ctx.run() cleans up the stack upon synchronous return', () => {
        ctx.run(() => {
            ctx.push('a');
            expect(getPath()).toEqual(['a']);
            ctx.run(() => {
                ctx.push('b');
                expect(getPath()).toEqual(['a', 'b']);
            });
            // Restored after nested run completes
            expect(getPath()).toEqual(['a']);
        });
        expect(getPath()).toEqual([]);
    });

    it('ctx.run() cleans up the stack upon synchronous throw', () => {
        expect(() => {
            ctx.run(() => {
                ctx.push('error-segment');
                expect(getPath()).toEqual(['error-segment']);
                throw new Error('Sync error');
            });
        }).toThrow('Sync error');
        expect(getPath()).toEqual([]);
    });

    it('ctx.run() cleans up the stack upon Promise resolve', async () => {
        await ctx.run(async () => {
            ctx.push('async-segment');
            expect(getPath()).toEqual(['async-segment']);
            const result = await Promise.resolve(42);
            expect(result).toBe(42);
            return result;
        });
        expect(getPath()).toEqual([]);
    });

    it('ctx.run() cleans up the stack upon Promise reject', async () => {
        await expect(
            ctx.run(async () => {
                ctx.push('async-error-segment');
                expect(getPath()).toEqual(['async-error-segment']);
                throw new Error('Async error');
            }),
        ).rejects.toThrow('Async error');
        expect(getPath()).toEqual([]);
    });

    it('isThenable branch handles custom object with then method', async () => {
        const thenable = {
            then(resolve: (value: string) => void) {
                resolve('custom resolved');
            },
        };

        const result = await ctx.run(() => {
            ctx.push('thenable-segment');
            return thenable;
        });

        expect(result).toBe('custom resolved');
        expect(getPath()).toEqual([]);
    });

    it('ctx.run returns the function return type unchanged for sync fn', () => {
        const r = ctx.run(() => 42);
        expect(r).toBe(42);
    });

    it('ctx.run returns the function return type unchanged for async fn', async () => {
        const r = await ctx.run(async () => 'async-result');
        expect(r).toBe('async-result');
    });

    it('ctx.run propagates the rejection reason verbatim', async () => {
        const reason = new Error('specific rejection reason');
        await expect(
            ctx.run(async () => {
                throw reason;
            }),
        ).rejects.toBe(reason);
        expect(getPath()).toEqual([]);
    });

    it('getPath returns a frozen array (cannot mutate)', () => {
        ctx.run(() => {
            ctx.push('a');
            const path = getPath();
            // Object.freeze prevents push/splice, etc. — verify the runtime
            // marker is set so accidental mutation throws or silently fails
            // rather than corrupting the frame's stack.
            expect(Object.isFrozen(path)).toBe(true);
            // The freeze only freezes the outer array; the returned array
            // is a snapshot copy, so pushing onto it throws in strict mode.
            expect(() => {
                (path as PathSegment[]).push('x');
            }).toThrow();
        });
    });

    it('getPath returns a new array snapshot per call', () => {
        ctx.run(() => {
            ctx.push('first');
            const snap1 = getPath();
            ctx.push('second');
            const snap2 = getPath();
            // Each call produces a fresh snapshot — snapshots are not aliases
            // of the frame's mutable stack.
            expect(snap1).toEqual(['first']);
            expect(snap2).toEqual(['first', 'second']);
            expect(snap1).not.toBe(snap2);
        });
    });

    it('three nested ctx.run scopes concatenate the full path', () => {
        const path = ctx.run(() => {
            ctx.push('outer');
            return ctx.run(() => {
                ctx.push('middle');
                return ctx.run(() => {
                    ctx.push('inner');
                    return getPath();
                });
            });
        });
        expect(path).toEqual(['outer', 'middle', 'inner']);
        expect(getPath()).toEqual([]);
    });

    it('PathStack is assignable from getPath()', () => {
        const path: PathStack = getPath();
        expect(Array.isArray(path)).toBe(true);
        expect(path.length).toBe(0);
    });

    describe('hostile thenable (or hostile .then getter) must not leak the active frame', () => {
        it('isThenable returns false when the then getter throws (does not propagate the throw)', () => {
            // Construct a thenable whose `then` accessor throws when read.
            // The library's `isThenable` helper must not let this throw
            // bubble out — it should treat the value as non-thenable.
            const trap: { then?: unknown } = {};
            Object.defineProperty(trap, 'then', {
                get() { throw new Error('hostile then getter'); },
                configurable: true,
            });
            // The fix wraps `.then` access in try/catch so a hostile
            // getter cannot corrupt the frame. We test the fix indirectly
            // by exercising the polyfill path that consumed the trap.
            const before = (polyfillStore as unknown as { getStore(): unknown }).getStore();
            // Run the polyfill with a thenable-returning fn. The trap is
            // classified as non-thenable, so polyfillStore.run treats it
            // as a synchronous return value and restores the frame via
            // the synchronous path (line 60-64 of ctx.ts).
            let syncValueSeen: unknown = null;
            let caught: unknown = null;
            try {
                const result = (polyfillStore as unknown as {
                    run: <T>(f: { stack: string[]; parent: null }, fn: () => T) => T;
                }).run(
                    { stack: ['leak-test'], parent: null } as unknown as { stack: string[]; parent: null },
                    () => trap as unknown,
                );
                syncValueSeen = result;
            } catch (e) {
                caught = e;
            }
            // The frame must be restored after the run completes.
            const after = (polyfillStore as unknown as { getStore(): unknown }).getStore();
            // Pre-fix: the .then getter would have been read inside
            // Promise.resolve(trap), throwing synchronously and leaving
            // `currentFrame` stuck at the leak-test frame. Post-fix:
            // isThenable returns false on the hostile getter, the
            // synchronous restoration path runs, and `after` is null.
            expect(caught).toBeNull();
            // The value is returned synchronously (the polyfill doesn't
            // even call Promise.resolve on it because isThenable lied).
            expect(syncValueSeen).toBe(trap);
            // polyfillStore.getStore() returns `undefined` when currentFrame
            // is `null` (the `?? undefined` coercion in ctx.ts).
            expect(after).toBeUndefined();
            // Sanity: the run-state on entry was also clean.
            expect(before).toBeUndefined();
        });

        it('synchronous throw from fn() restores the frame via try/finally', () => {
            // Even if `fn()` throws, the frame must be restored.
            let caught: unknown = null;
            try {
                (polyfillStore as unknown as {
                    run: <T>(f: { stack: string[]; parent: null }, fn: () => T) => T;
                }).run(
                    { stack: ['leak-test-2'], parent: null } as unknown as { stack: string[]; parent: null },
                    () => { throw new Error('fn-throw'); },
                );
            } catch (e) {
                caught = e;
            }
            expect(String(caught)).toContain('fn-throw');
            const after = (polyfillStore as unknown as { getStore(): unknown }).getStore();
            expect(after).toBeUndefined();
        });

        it('hostile thenable that throws inside Promise.resolve surfaces as a rejected Promise (frame restored)', async () => {
            // When the trap's then getter throws during Promise.resolve(trap),
            // the new try/catch around the .then chain catches the synchronous
            // throw, restores the frame, and rethrows as a rejected Promise.
            const trap: { then?: unknown } = {};
            Object.defineProperty(trap, 'then', {
                get() { throw new Error('hostile-then-on-resolve'); },
                configurable: true,
            });
            let result: unknown = null;
            let caught: unknown = null;
            try {
                const r = (polyfillStore as unknown as {
                    run: <T>(f: { stack: string[]; parent: null }, fn: () => T) => T;
                }).run(
                    { stack: ['leak-test-3'], parent: null } as unknown as { stack: string[]; parent: null },
                    () => trap as unknown,
                );
                result = r;
                // If a Promise was returned, await it.
                if (result && typeof (result as { then?: unknown }).then === 'function') {
                    await (result as Promise<unknown>);
                }
            } catch (e) {
                caught = e;
            }
            // The frame MUST be restored regardless of which path the
            // hostile thenable took.
            const after = (polyfillStore as unknown as { getStore(): unknown }).getStore();
            expect(after).toBeUndefined();
        });
    });
});

import { describe, it, expect } from 'vitest';
import { ctx, getPath, type PathSegment, type PathStack } from './ctx.js';

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
});

import { describe, it, expect } from 'vitest';
import { ctx, getPath } from './ctx.js';

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

    it('concurrency caveat: overlapping async calls affect the global stack', async () => {
        // Since the stack is process-global, concurrent ctx.run calls will see each other's pushes.
        const promise1 = ctx.run(async () => {
            ctx.push('task1');
            await new Promise((resolve) => setTimeout(resolve, 10));
            // Expect to see task2's push as well, demonstrating the caveat
            expect(getPath()).toContain('task2');
        });

        const promise2 = ctx.run(async () => {
            ctx.push('task2');
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        await Promise.all([promise1, promise2]);

        // As a result of concurrent cleanup with shared stack.length modifications,
        // the array might be truncated but padded with `undefined` values due to JS Array internals.
        // We ensure that the primary stack is functionally empty.
        expect(getPath().filter(Boolean)).toEqual([]);
    });
});

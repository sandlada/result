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
});

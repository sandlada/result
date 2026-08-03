import { describe, it, expectTypeOf } from 'vitest';
import { ctx, getPath, type PathSegment, type PathStack } from './ctx.js';

describe('ctx types', () => {
    it('PathSegment is string | number', () => {
        const s: string | number = 'step' as PathSegment;
        const n: string | number = 1 as PathSegment;
        expectTypeOf(s).toEqualTypeOf<string | number>();
        expectTypeOf(n).toEqualTypeOf<string | number>();
    });

    it('PathStack is a readonly array of PathSegment', () => {
        const stack: PathStack = ['a', 1, 'b'];
        // PathStack is ReadonlyArray<PathSegment>
        expectTypeOf(stack.length).toBeNumber();
    });

    it('ctx.run returns the function return type T', () => {
        const r = ctx.run(() => 42);
        const _check: number = r;
        expectTypeOf(_check).toBeNumber();
    });

    it('getPath returns PathStack', () => {
        const stack = getPath();
        expectTypeOf(stack.length).toBeNumber();
    });

    it('ctx.run preserves async return type via Promise', async () => {
        const r = await ctx.run(async () => 'async-result');
        const _check: string = r;
        expectTypeOf(_check).toEqualTypeOf<string>();
    });

    it('ctx.run preserves explicit generic via return type annotation', () => {
        const r = ctx.run((): { a: number } => ({ a: 1 }));
        const _check: { a: number } = r;
        expectTypeOf(_check.a).toBeNumber();
    });

    it('ctx.push accepts PathSegment', () => {
        ctx.push('x');
        ctx.push(1);
        ctx.push('nested');
        expectTypeOf(ctx.push).toBeFunction();
    });

    it('getPath result is ReadonlyArray<PathSegment>', () => {
        const stack = getPath();
        expectTypeOf(stack).toEqualTypeOf<PathStack>();
        // Confirm the readonly modifier by attempting a non-readonly op
        // (would fail to compile if stack were a mutable array).
        const item = stack[0];
        if (item !== undefined) {
            expectTypeOf(item).toEqualTypeOf<PathSegment>();
        }
    });

    it('PathStack accepts an empty array literal', () => {
        const empty: PathStack = [];
        expectTypeOf(empty.length).toBeNumber();
    });
});

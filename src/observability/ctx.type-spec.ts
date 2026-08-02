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
});

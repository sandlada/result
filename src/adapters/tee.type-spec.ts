import { describe, it, expectTypeOf } from 'vitest';
import { tee } from './tee.js';

describe('tee types', () => {
    it('returns a function from A to A', () => {
        const fn = tee((x: number) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: number) => number>();
    });

    it('preserves the input/output type', () => {
        const fn = tee((s: string) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: string) => string>();
    });

    it('preserves object type end-to-end', () => {
        type User = { id: number; name: string };
        const fn = tee((u: User) => { /* side effect */ });
        expectTypeOf(fn).toEqualTypeOf<(a: User) => User>();
    });

    it('the callback may return void (parameter type is irrelevant to result)', () => {
        const fn = tee((n: number) => undefined);
        expectTypeOf(fn).toEqualTypeOf<(a: number) => number>();
    });
});

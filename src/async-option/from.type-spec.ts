import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('from types', () => {
    it('returns AsyncOption<T> from a thunk returning Promise<IOption<T>>', () => {
        const r = from(() => Promise.resolve(ofSome(42)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from the thunk return', () => {
        const r = from(() => Promise.resolve(ofSome('hi')));
        const _check: AsyncOption<string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers T from Promise<IOptionNone> as AsyncOption<never>', () => {
        const r = from(() => Promise.resolve(ofSome(42) as never));
        const _check: AsyncOption<never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('carrier accepts an inline { run: () => Promise<IOption<T>> } shape', () => {
        // The thunk shape is the canonical carrier contract; an inline literal
        // must type-check as AsyncOption<T> when assigned the result.
        const r: AsyncOption<number> = from(() => Promise.resolve(ofSome(42)));
        expectTypeOf(r).toMatchTypeOf<AsyncOption<number>>();
    });

    it('infers generic T through union (no widening to never)', () => {
        const r = from(() => Promise.resolve(ofSome<number | string>(42)));
        const _check: AsyncOption<number | string> = r;
        expectTypeOf(_check).toBeObject();
    });
});

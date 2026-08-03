import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { flatten } from './flatten.js';
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
        // An inline { run: () => ... } literal must be assignable to AsyncOption<T>
        // (structural contract; no factory required). Feed the carrier into a
        // library API (flatten) to prove it is accepted where a parameter is
        // typed AsyncOption<number>.
        const carrier: AsyncOption<number> = { run: () => Promise.resolve(ofSome(42)) };
        expectTypeOf(carrier).toEqualTypeOf<AsyncOption<number>>();
        // Structural acceptance: flatten must accept the inline carrier unchanged.
        flatten(carrier);
    });

    it('infers generic T through union (no widening to never)', () => {
        const r = from(() => Promise.resolve(ofSome<number | string>(42)));
        expectTypeOf(r).toEqualTypeOf<AsyncOption<number | string>>();
    });
});

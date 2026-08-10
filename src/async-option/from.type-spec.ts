import { describe, it, expectTypeOf } from 'vitest';
import { from } from './from.js';
import { map } from './map.js';
import { ofSome, ofNone } from '../option/index.js';
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

    it('infers T from Promise<IOptionNone> as AsyncOption<unknown>', () => {
        // `ofNone()` is typed `IOption<unknown>` (default `T = unknown` for
        // contextual typing). The async carrier's `T` follows that default
        // unless the caller pins it explicitly via `from<number>(() => ...)` or
        // a contextual annotation on the receiving slot.
        const r = from(() => Promise.resolve(ofNone()));
        const _check: AsyncOption<unknown> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('carrier accepts an inline { run: () => Promise<IOption<T>> } shape', () => {
        // An inline { run: () => ... } literal must be assignable to AsyncOption<T>
        // (structural contract; no factory required). Feed the carrier into a
        // library API (map) to prove it is accepted where a parameter is
        // typed AsyncOption<number>.
        const carrier: AsyncOption<number> = { run: () => Promise.resolve(ofSome(42)) };
        expectTypeOf(carrier).toEqualTypeOf<AsyncOption<number>>();
        // Structural acceptance: map must accept the inline carrier unchanged.
        expectTypeOf(map((n: number) => n + 1, carrier)).toEqualTypeOf<AsyncOption<number>>();
    });

    it('infers generic T through union (no widening to never)', () => {
        const r = from(() => Promise.resolve(ofSome<number | string>(42)));
        expectTypeOf(r).toEqualTypeOf<AsyncOption<number | string>>();
    });
});

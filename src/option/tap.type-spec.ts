import { describe, it, expectTypeOf } from 'vitest';
import { tap } from './tap.js';
import { ofSome, ofNone } from './index.js';
import type { IOption } from '../types/Option.js';

describe('tap types', () => {
    it('returns a function from IOption<T> to IOption<T>', () => {
        const fn = tap((x: number) => { /* side effect */ });
        const _check: (opt: IOption<number>) => IOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T from the wrapped callback', () => {
        const fn = tap((s: string) => { /* side effect */ });
        const _check: (opt: IOption<string>) => IOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('does not change the wrapped value type', () => {
        const r = tap((x: number) => { /* side effect */ })(ofSome(42));
        if (r.isSome) {
            expectTypeOf(r.value).toEqualTypeOf<number>();
        }
    });

    it('passes None through unchanged', () => {
        const r = tap((x: number) => { /* side effect */ })(ofNone());
        expectTypeOf(r.isNone).toBeBoolean();
    });
});

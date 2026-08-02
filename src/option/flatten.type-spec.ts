import { describe, it, expectTypeOf } from 'vitest';
import { flatten } from './flatten.js';
import { ofSome } from './index.js';
import type { IOption } from '../types/Option.js';

describe('flatten types', () => {
    it('flattens IOption<IOption<T>> to IOption<T>', () => {
        const opt = flatten(ofSome(ofSome(42)));
        const _check: IOption<number> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('handles string-typed inner option', () => {
        const opt = flatten(ofSome(ofSome('hi')));
        const _check: IOption<string> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('narrowing on flattened Some yields T', () => {
        const opt = flatten(ofSome(ofSome(42)));
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
        }
    });
});

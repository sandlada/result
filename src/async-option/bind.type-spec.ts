import { describe, it, expectTypeOf } from 'vitest';
import { bind } from './bind.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('bind types', () => {
    it('curried form returns (ao: AsyncOption<T>) => AsyncOption<U>', () => {
        const fn = bind((x: number) => fromOption(ofSome(x.toString())));
        const _check: (ao: AsyncOption<number>) => AsyncOption<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncOption<U>', () => {
        const r = bind((x: number) => fromOption(ofSome(x * 2)), fromOption(ofSome(21)));
        const _check: AsyncOption<number> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves U from the wrapped function', () => {
        const fn = bind((s: string) => fromOption(ofSome(s.length)));
        const _check: (ao: AsyncOption<string>) => AsyncOption<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});

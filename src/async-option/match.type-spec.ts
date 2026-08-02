import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { fromOption } from './index.js';
import { ofSome } from '../option/index.js';
import type { AsyncOption } from '../types/AsyncOption.js';

describe('match types', () => {
    it('curried form returns (ao: AsyncOption<T>) => Promise<U>', () => {
        const fn = match({ some: (v: number) => `value: ${v}`, none: () => 'nothing' });
        const _check: (ao: AsyncOption<number>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<U>', () => {
        const p = match(
            { some: (v: number) => `value: ${v}`, none: () => 'nothing' },
            fromOption(ofSome(42)),
        );
        expectTypeOf(p).toEqualTypeOf<Promise<string>>();
    });

    it('handlers may return Promise<U>', () => {
        const fn = match({
            some: async (v: number) => `value: ${v}`,
            none: async () => 'nothing',
        });
        const _check: (ao: AsyncOption<number>) => Promise<string> = fn;
        expectTypeOf(_check).toBeFunction();
    });
});

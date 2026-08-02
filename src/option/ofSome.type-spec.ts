import { describe, it, expectTypeOf } from 'vitest';
import { ofSome } from './ofSome.js';
import type { IOption, IOptionSome } from '../types/Option.js';

describe('ofSome types', () => {
    it('returns IOption<T>', () => {
        const opt = ofSome(42);
        const _check: IOption<number> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('narrows to IOptionSome with value', () => {
        const opt = ofSome(42);
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number>();
            const _check: IOptionSome<number> = opt;
            expectTypeOf(_check).toBeObject();
        }
    });

    it('preserves complex object types', () => {
        const opt = ofSome({ id: 1, name: 'Alice' });
        const _check: IOption<{ id: number; name: string }> = opt;
        expectTypeOf(_check).toBeObject();
    });

    it('handles nullable T', () => {
        const opt = ofSome<number | null>(null);
        if (opt.isSome) {
            expectTypeOf(opt.value).toEqualTypeOf<number | null>();
        }
    });
});

import { describe, it, expectTypeOf } from 'vitest';
import { toOption } from './toOption.js';
import { ok, err } from '../factories/index.js';
import type { IOption } from '../types/Option.js';

describe('toOption types', () => {
    it('returns IOption<A> for a success result', () => {
        const opt = toOption(ok(42));
        expectTypeOf(opt).toMatchTypeOf<IOption<number>>();
    });

    it('returns IOption<A> for a failure result (error info is discarded)', () => {
        const opt = toOption(err('boom'));
        expectTypeOf(opt).toMatchTypeOf<IOption<never>>();
    });

    it('preserves the value type from IResultOfT<T, E>', () => {
        const opt = toOption(ok('hello'));
        expectTypeOf(opt).toMatchTypeOf<IOption<string>>();
    });

    it('preserves value type from complex object', () => {
        const opt = toOption(ok({ id: 1, name: 'Alice' }));
        expectTypeOf(opt).toMatchTypeOf<IOption<{ id: number; name: string }>>();
    });
});

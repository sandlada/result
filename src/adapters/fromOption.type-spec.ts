import { describe, it, expectTypeOf } from 'vitest';
import { fromOption } from './fromOption.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';

describe('fromOption types', () => {
    it('curried form returns a function mapping IOption<A> to IResultOfT<A, E>', () => {
        const fn = fromOption<string>('missing');
        expectTypeOf(fn).toEqualTypeOf<<A>(opt: IOption<A>) => IResultOfT<A, string>>();
    });

    it('direct form returns IResultOfT<A, E>', () => {
        const r = fromOption('missing', ofSome(42));
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the value type from the Some variant', () => {
        const r = fromOption('missing', ofSome('hello'));
        const _check: IResultOfT<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the error type from errorOnNone', () => {
        type AppError = { kind: 'NotFound'; id: string };
        // Use let with explicit type annotation to drive inference.
        const errorOnNone: AppError = { kind: 'NotFound', id: 'x' };
        const opt: IOption<never> = ofNone();
        const r = fromOption(errorOnNone, opt);
        const _check: IResultOfT<never, AppError> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the value type from a complex IOption variant', () => {
        const opt = ofSome({ id: 1, name: 'Alice' });
        const r = fromOption('missing', opt);
        const _check: IResultOfT<{ id: number; name: string }, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('error type is inferred when not annotated', () => {
        const r = fromOption(new Error('missing'), ofSome(42));
        const _check: IResultOfT<number, Error> = r;
        expectTypeOf(_check).toBeObject();
    });
});

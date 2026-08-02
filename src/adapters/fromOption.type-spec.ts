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

    it('curried form keeps the error type across invocations', () => {
        type E = { code: number };
        const fn = fromOption<E>({ code: 1 });
        const a = fn(ofSome('x'));
        const b = fn(ofNone());
        const _checkA: IResultOfT<string, E> = a;
        const _checkB: IResultOfT<never, E> = b;
        expectTypeOf(_checkA).toBeObject();
        expectTypeOf(_checkB).toBeObject();
    });

    it('preserves literal narrowing from ofSome', () => {
        const r = fromOption('missing', ofSome('y' as const));
        const _check: IResultOfT<'y', string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('A type parameter is polymorphic in the curried form', () => {
        const fn = fromOption<number>(404);
        const a = fn(ofSome('hello'));
        const b = fn(ofNone());
        // a: IResultOfT<string, number>; b: IResultOfT<never, number>
        const _checkA: IResultOfT<string, number> = a;
        const _checkB: IResultOfT<never, number> = b;
        expectTypeOf(_checkA).toBeObject();
        expectTypeOf(_checkB).toBeObject();
    });

    it('preserves null and undefined Some values end-to-end', () => {
        const r1 = fromOption('missing', ofSome(null));
        const r2 = fromOption('missing', ofSome(undefined));
        const _check1: IResultOfT<null, string> = r1;
        const _check2: IResultOfT<undefined, string> = r2;
        expectTypeOf(_check1).toBeObject();
        expectTypeOf(_check2).toBeObject();
    });
});

import { describe, it, expectTypeOf } from 'vitest';
import { match } from './match.js';
import { err, ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('match types', () => {
    it('positional curried form returns the common handler type', () => {
        const fn = match(
            (value: number) => value.toString(),
            (error: Error) => error.message,
        );
        const _check: (r: IResultOfT<number, Error>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('object curried form returns the common handler type', () => {
        const fn = match({
            ok: (value: number) => value.toString(),
            err: (error: Error) => error.message,
        });
        const _check: (r: IResultOfT<number, Error>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('supports direct positional and object forms', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const positional = match(
            (value: number) => value.toString(),
            (error: Error) => error.message,
            input,
        );
        const object = match({
            ok: (value: number) => value.toString(),
            err: (error: Error) => error.message,
        }, input);
        const _positionalCheck: string = positional;
        const _objectCheck: string = object;
        expectTypeOf(_positionalCheck).toBeString();
        expectTypeOf(_objectCheck).toBeString();
    });

    it('handler return types are unified (Group B)', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = match(
            (v: number): 1 | 2 => 1,
            (_e: string): 1 | 2 => 2,
            input,
        );
        expectTypeOf(result).toEqualTypeOf<1 | 2>();
    });

    it('object form preserves the same union of return types (Group B)', () => {
        const input = err('e') as IResultOfT<number, string>;
        const result = match({
            ok: (v: number): 1 | 2 => 1,
            err: (_e: string): 1 | 2 => 2,
        }, input);
        expectTypeOf(result).toEqualTypeOf<1 | 2>();
    });
});

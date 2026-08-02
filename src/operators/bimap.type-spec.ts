import { describe, it, expectTypeOf } from 'vitest';
import { bimap } from './bimap.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('bimap types', () => {
    it('curried form maps both tracks', () => {
        const fn = bimap(
            (value: number) => value.toString(),
            (error: Error) => error.message.length,
        );
        const _check: (r: IResultOfT<number, Error>) => IResultOfT<string, number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns both mapped types', () => {
        const input = err(new Error('boom')) as IResultOfT<number, Error>;
        const result = bimap(
            (value: number) => value.toString(),
            (error: Error) => error.message.length,
            input,
        );
        const _check: IResultOfT<string, number> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves narrowing on the mapped result', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = bimap((value: number) => value.toString(), (error: Error) => error.message, input);
        if (result.isSuccess) expectTypeOf(result.value).toBeString();
        else expectTypeOf(result.error).toBeString();
    });

    it('widens each track to its mapped output type (Group B)', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = bimap(
            (v: number) => v.toString(),
            (e: Error) => e.message.length,
            input,
        );
        const _check: IResultOfT<string, number> = result;
        expectTypeOf(_check).toBeObject();
    });
});

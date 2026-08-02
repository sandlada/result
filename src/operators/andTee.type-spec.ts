import { describe, it, expectTypeOf } from 'vitest';
import { andTee } from './andTee.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('andTee types', () => {
    it('curried form preserves the input value and error types', () => {
        const fn = andTee((value: string) => ok(value.length));
        const _check: (r: IResultOfT<string, Error>) => IResultOfT<string, Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form ignores the callback result types', () => {
        const input = ok('value') as IResultOfT<string, Error>;
        const result = andTee((value: string) => ok(value.length), input);
        const _check: IResultOfT<string, Error> = result;
        expectTypeOf(_check).toBeObject();
    });
});

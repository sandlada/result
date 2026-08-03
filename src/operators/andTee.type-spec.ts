import { describe, it, expectTypeOf } from 'vitest';
import { andTee } from './andTee.js';
import { err, ok } from '../factories/index.js';
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

    it('preserves the original success value type (Group B)', () => {
        const result = andTee((_v: number) => ok('replaced') as IResultOfT<string, never>, ok(42) as IResultOfT<number, Error>);
        if (result.isSuccess) expectTypeOf(result.value).toBeNumber();
    });

    it('preserves the original error type on failure (Group B)', () => {
        const result = andTee((_v: number) => ok('x'), err<string>('boom') as IResultOfT<number, string>);
        if (result.isFailure) expectTypeOf(result.error).toBeString();
    });
});

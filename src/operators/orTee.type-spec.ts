import { describe, it, expectTypeOf } from 'vitest';
import { orTee } from './orTee.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orTee types', () => {
    it('curried form preserves the input success and error types', () => {
        const fn = orTee((error: string) => ok(error.length));
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form ignores the callback result types', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = orTee((error: string) => ok(error.length), input);
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves the original error type on failure (Group B)', () => {
        const result = orTee((_e: number) => ok('x'), err<number>(404) as IResultOfT<string, number>);
        if (result.isFailure) expectTypeOf(result.error).toBeNumber();
    });

    it('preserves the original success type on success (Group B)', () => {
        const result = orTee((_e: string) => ok('x'), ok(7) as IResultOfT<number, string>);
        if (result.isSuccess) expectTypeOf(result.value).toBeNumber();
    });
});

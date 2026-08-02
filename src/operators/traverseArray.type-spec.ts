import { describe, it, expectTypeOf } from 'vitest';
import { traverseArray } from './traverseArray.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('traverseArray types', () => {
    it('curried form maps readonly arrays into a Result of an array', () => {
        const fn = traverseArray(
            (value: number, index: number) => ok(`${index}:${value}`) as IResultOfT<string, Error>,
        );
        const _check: (items: readonly number[]) => IResultOfT<string[], Error> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form collects the callback success type', () => {
        const result = traverseArray(
            (value: number, index: number) => ok(`${index}:${value}`) as IResultOfT<string, Error>,
            [1, 2, 3] as const,
        );
        const _check: IResultOfT<string[], Error> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('types the callback index as number', () => {
        traverseArray((value: string, index) => {
            expectTypeOf(index).toBeNumber();
            return ok(value) as IResultOfT<string, Error>;
        }, ['a']);
    });
});

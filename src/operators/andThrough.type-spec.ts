import { describe, it, expectTypeOf } from 'vitest';
import { andThrough } from './andThrough.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('andThrough types', () => {
    it('curried form preserves the value and widens the error type', () => {
        const fn = andThrough((value: string) => ok(value.length) as IResultOfT<number, RangeError>);
        const _check: (r: IResultOfT<string, TypeError>) => IResultOfT<string, TypeError | RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves the original success type', () => {
        const input = ok('value') as IResultOfT<string, TypeError>;
        const result = andThrough(
            (value: string) => ok(value.length) as IResultOfT<number, RangeError>,
            input,
        );
        const _check: IResultOfT<string, TypeError | RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });
});

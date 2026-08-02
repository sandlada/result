import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orElse types', () => {
    it('curried form unions the success types and replaces the error type', () => {
        const fn = orElse((error: string) => ok(error.length > 0) as IResultOfT<boolean, RangeError>);
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number | boolean, RangeError> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form unions the original and recovery success types', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = orElse(
            (error: string) => ok(error.length > 0) as IResultOfT<boolean, RangeError>,
            input,
        );
        const _check: IResultOfT<number | boolean, RangeError> = result;
        expectTypeOf(_check).toBeObject();
    });
});

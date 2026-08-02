import { describe, it, expectTypeOf } from 'vitest';
import { mapOrElse } from './mapOrElse.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('mapOrElse types', () => {
    it('curried form returns the common handler type', () => {
        const fn = mapOrElse(
            (error: Error) => error.message,
            (value: number) => value.toString(),
        );
        const _check: (r: IResultOfT<number, Error>) => string = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns the common handler type', () => {
        const input = ok(42) as IResultOfT<number, Error>;
        const result = mapOrElse(
            (error: Error) => error.message,
            (value: number) => value.toString(),
            input,
        );
        const _check: string = result;
        expectTypeOf(_check).toBeString();
    });
});

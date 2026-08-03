import { describe, it, expectTypeOf } from 'vitest';
import { withPath } from './withPath.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('withPath types', () => {
    it('withPath(segment) returns void', () => {
        const r: void = withPath('fetchUser');
        expectTypeOf(r).toEqualTypeOf<void>();
    });

    it('withPath(segment, r) returns IResultOfT<T, E>', () => {
        const r = withPath('fetchUser', ok(42));
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from input', () => {
        const errVal: IResultOfT<string, Error> = err(new Error('x'));
        const r = withPath('id:1', errVal);
        const _check: IResultOfT<string, Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves literal type for numeric values', () => {
        const literalOk = ok(42 as const);
        const r = withPath('lit', literalOk);
        // The value type should remain the literal/narrowed type from input.
        expectTypeOf(r).toEqualTypeOf<IResultOfT<42, never>>();
    });

    it('preserves union error types', () => {
        const errVal: IResultOfT<number, string | Error> = err('boom') as IResultOfT<number, string | Error>;
        const r = withPath('u', errVal);
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number, string | Error>>();
    });
});

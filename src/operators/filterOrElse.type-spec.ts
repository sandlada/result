import { describe, it, expectTypeOf } from 'vitest';
import { filterOrElse } from './filterOrElse.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('filterOrElse types', () => {
    it('curried form preserves the result types', () => {
        const fn = filterOrElse(
            (value: number) => value > 0,
            (value: number) => `invalid: ${value}`,
        );
        const _check: (r: IResultOfT<number, string>) => IResultOfT<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form preserves the success and error types', () => {
        const input = ok(42) as IResultOfT<number, string>;
        const result = filterOrElse(
            (value: number) => value > 0,
            (value: number) => `invalid: ${value}`,
            input,
        );
        const _check: IResultOfT<number, string> = result;
        expectTypeOf(_check).toBeObject();
    });

    it('errorFn cannot widen the error type — E is shared with the input', () => {
        // CONTRACT GAP (pinned): `filterOrElse<A, E>(predicate, errorFn: (a: A) => E,
        // r: IResultOfT<A, E>)` binds a *single* `E`. The `errorFn` return type
        // must match the input's error type — it cannot introduce a new/wider
        // error type the way `andThrough` (`E | F`) does. Pinned rather than
        // "fixed" because adding a second error parameter would change the
        // public API.
        const input = ok(0) as IResultOfT<number, string>;
        const result = filterOrElse(
            (_x: number) => false,
            // @ts-expect-error errorFn must return E (string here), not a new shape
            (x: number): { code: number; value: number } => ({ code: 1, value: x }),
            input,
        );
        void result;

        // Matching E is accepted and preserved.
        const same = filterOrElse((_x: number) => false, (x: number) => `bad:${x}`, input);
        expectTypeOf(same).toEqualTypeOf<IResultOfT<number, string>>();
    });
});

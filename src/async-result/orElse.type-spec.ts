import { describe, it, expectTypeOf } from 'vitest';
import { orElse } from './orElse.js';
import { fromResult } from './fromResult.js';
import { from } from './from.js';
import { fromPromise } from './fromPromise.js';
import { err, ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orElse types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E | F>', () => {
        const fn = orElse((e: string) => fromResult(ok(0) as unknown as IResultOfT<number, number>));
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string | number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E | F>', () => {
        const r = orElse<number, string, number>(
            (e) => fromResult(ok(0) as unknown as IResultOfT<number, number>),
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string | number> = r;
        expectTypeOf(_check).toBeObject();
    });

    // ── Mixed-carrier return types (brief Step 8.1) ────────────────────────
    it('callback returning Promise<IResultOfT<T, F>> is accepted', () => {
        const fn = orElse<string, number, string>((_e: number) => Promise.resolve(ok('p') as IResultOfT<string, string>));
        expectTypeOf(fn).toBeFunction();
    });

    it('callback returning from() thunk carrier is accepted', () => {
        const fn = orElse<string, number, string>((_e: number) => from(() => Promise.resolve(ok('t') as IResultOfT<string, string>)));
        expectTypeOf(fn).toBeFunction();
    });

    it('callback returning fromPromise() carrier is accepted', () => {
        const fn = orElse<string, number, string>((_e: number) => fromPromise(() => Promise.resolve('fp')));
        expectTypeOf(fn).toBeFunction();
    });

    it('direct form with mixed carriers accepts AsyncResult recovery', () => {
        const ar = orElse<number, string, number>(
            (_e) => fromResult(ok(0) as IResultOfT<number, number>),
            fromResult(err('orig') as IResultOfT<number, string>),
        );
        expectTypeOf(ar).toEqualTypeOf<AsyncResult<number, string | number>>();
    });
});

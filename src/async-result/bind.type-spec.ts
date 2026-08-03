import { describe, it, expectTypeOf } from 'vitest';
import { bind } from './bind.js';
import { fromResult } from './fromResult.js';
import { from } from './from.js';
import { fromPromise } from './fromPromise.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('bind types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<U, E>', () => {
        const fn = bind<number, number, string>((x) => fromResult(ok(x * 2) as IResultOfT<number, string>));
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves U from the wrapped function', () => {
        const fn = bind<string, number, string>((s) => fromResult(ok(s.length) as IResultOfT<number, string>));
        const _check: (ar: AsyncResult<string, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<U, E>', () => {
        const ar: AsyncResult<number, string> = fromResult(ok(21) as IResultOfT<number, string>);
        const r = bind<number, number, string>((x) => fromResult(ok(x * 2) as IResultOfT<number, string>), ar);
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    // ── Mixed-carrier return types (brief Step 8.1) ────────────────────────
    it('callback returning AsyncResult<U, E> is accepted', () => {
        const fn = bind<number, number, string>((x) => fromResult(ok(x * 2) as IResultOfT<number, string>));
        expectTypeOf(fn).toBeFunction();
    });

    it('callback returning Promise<IResultOfT<U, E>> is accepted', () => {
        const fn = bind<number, number, string>((x) => Promise.resolve(ok(x * 2) as IResultOfT<number, string>));
        expectTypeOf(fn).toBeFunction();
    });

    it('callback returning from() thunk carrier is accepted', () => {
        const fn = bind<number, number, string>((x) => from(() => Promise.resolve(ok(x * 2) as IResultOfT<number, string>)));
        expectTypeOf(fn).toBeFunction();
    });

    it('callback returning fromPromise() carrier is accepted', () => {
        const fn = bind<number, number, string>((x) => fromPromise(() => Promise.resolve(x * 2)));
        expectTypeOf(fn).toBeFunction();
    });
});

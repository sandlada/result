import { describe, it, expectTypeOf } from 'vitest';
import type { AsyncResult } from './AsyncResult.js';
import type { IResultOfT } from './IResultOfT.js';
import { ok, err } from '../factories/index.js';

describe('AsyncResult types', () => {
    it('run() returns Promise<IResultOfT<T, E>>', () => {
        type AR = AsyncResult<number, string>;
        type R = ReturnType<AR['run']>;
        const _check: Promise<IResultOfT<number, string>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('AsyncResult defaults E to unknown', () => {
        type AR = AsyncResult<number>;
        type R = ReturnType<AR['run']>;
        const _check: Promise<IResultOfT<number, unknown>> = null as unknown as R;
        expectTypeOf(_check).toBeObject();
    });

    it('structural compatibility: a plain object with .run() is AsyncResult', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        expectTypeOf(ar.run).toEqualTypeOf<() => Promise<IResultOfT<number, string>>>();
    });

    it('run() resolves with success variant', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(ok(42) as IResultOfT<number, string>),
        };
        const result = ar.run();
        expectTypeOf(result).toBeObject();
    });

    it('run() resolves with failure variant', () => {
        const ar: AsyncResult<number, string> = {
            run: () => Promise.resolve(err('fail') as IResultOfT<number, string>),
        };
        const result = ar.run();
        expectTypeOf(result).toBeObject();
    });
});

import { describe, it, expectTypeOf } from 'vitest';
import { fromSafePromise } from './fromSafePromise.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('fromSafePromise types', () => {
    it('returns Promise<IResultOfT<T, Error>>', () => {
        const p = fromSafePromise(Promise.resolve(42));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number, Error>>>();
    });

    it('infers T from the promise', () => {
        const p = fromSafePromise(Promise.resolve('hello'));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<string, Error>>>();
    });

    it('error type is always Error (not user-controllable)', () => {
        const p = fromSafePromise(Promise.resolve(true));
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<boolean, Error>>>();
    });
});

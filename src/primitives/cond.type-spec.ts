import { describe, it, expectTypeOf } from 'vitest';
import { cond } from './cond.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('cond types', () => {
    it('returns IResultOfT<T, E>', () => {
        const r = cond((n: number) => n > 0, 'must be positive', 5);
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from value argument', () => {
        const r = cond((s: string) => s.length > 0, 'empty', 'hi');
        const _check: IResultOfT<string, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('infers E from errorOnFalse', () => {
        const r = cond((n: number) => n > 0, new Error('fail'), 5);
        const _check: IResultOfT<number, Error> = r;
        expectTypeOf(_check).toBeObject();
    });
});

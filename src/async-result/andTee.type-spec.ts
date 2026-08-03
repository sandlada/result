import { describe, it, expectTypeOf } from 'vitest';
import { andTee } from './andTee.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { AsyncResult } from '../types/AsyncResult.js';

describe('andTee types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E>', () => {
        const fn: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = andTee<number, string>((v: number) => { void v; });
        expectTypeOf(fn).toBeFunction();
    });

    it('preserves T and E', () => {
        const fn: (ar: AsyncResult<string, number>) => AsyncResult<string, number> = andTee<string, number>((s: string) => { void s; });
        expectTypeOf(fn).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const ar: AsyncResult<number, string> = fromResult(ok(42) as IResultOfT<number, string>);
        const r = andTee<number, string>(
            (v: number) => { void v; },
            ar,
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts an async side-effect callback (returns Promise<unknown>)', () => {
        const fn = andTee<number, string>(async (_v: number) => 0);
        expectTypeOf(fn).toBeFunction();
    });

    it('E stays exactly the same type — no widening via andTee', () => {
        type VErr = { code: number };
        const ar: AsyncResult<number, VErr> = fromResult(ok(1) as IResultOfT<number, VErr>);
        const r = andTee<number, VErr>((_v: number) => {}, ar);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, VErr>>();
    });
});

import { describe, it, expectTypeOf } from 'vitest';
import { orTee } from './orTee.js';
import { fromResult } from './fromResult.js';
import { ok } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('orTee types', () => {
    it('curried form returns (ar: AsyncResult<T, E>) => AsyncResult<T, E>', () => {
        const fn = orTee<number, string>((e: string) => {
            void e;
        });
        const _check: (ar: AsyncResult<number, string>) => AsyncResult<number, string> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('preserves T and E', () => {
        const fn = orTee<string, number>((e: number) => {
            void e;
        });
        const _check: (ar: AsyncResult<string, number>) => AsyncResult<string, number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns AsyncResult<T, E>', () => {
        const r = orTee<number, string>(
            (e: string) => {
                void e;
            },
            fromResult(ok(42) as unknown as IResultOfT<number, string>),
        );
        const _check: AsyncResult<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('accepts an async side-effect callback (returns Promise<unknown>)', () => {
        const fn = orTee<number, string>(async (_e: string) => 0);
        expectTypeOf(fn).toBeFunction();
    });

    it('E stays exactly the same type — no widening via orTee', () => {
        type VErr = { code: number };
        const ar: AsyncResult<number, VErr> = fromResult(ok(1) as IResultOfT<number, VErr>);
        const r = orTee<number, VErr>((_e: VErr) => {}, ar);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number, VErr>>();
    });
});

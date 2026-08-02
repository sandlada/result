import { describe, it, expectTypeOf } from 'vitest';
import { safeTry, fromSafeTry } from './safeTry.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('safeTry types', () => {
    it('safeTry yields T on success path', () => {
        function* gen() {
            const x = yield* safeTry(ok(42));
            return x ?? 0;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('safeTry yields error on failure path', () => {
        const errVal: IResultOfT<number, string> = err<string>('fail') as IResultOfT<number, string>;
        function* gen() {
            const x = yield* safeTry(errVal);
            return x ?? 0;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T from safeTry arguments', () => {
        function* gen() {
            const x = yield* safeTry(ok('hi'));
            return (x ?? '').length;
        }
        const r = fromSafeTry(gen);
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });
});

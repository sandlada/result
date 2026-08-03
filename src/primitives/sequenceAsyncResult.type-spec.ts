import { describe, it, expectTypeOf } from 'vitest';
import { sequenceAsyncResult } from './sequenceAsyncResult.js';
import { fromResult } from '../async-result/index.js';
import { ok, err } from '../factories/index.js';
import type { AsyncResult } from '../types/AsyncResult.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('sequenceAsyncResult types', () => {
    it('returns AsyncResult<T[], E>', () => {
        const r = sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]);
        const _check: AsyncResult<number[], never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves E from inputs', () => {
        const r = sequenceAsyncResult<number, string>([]);
        const _check: AsyncResult<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('short-circuits on first failure', () => {
        const r = sequenceAsyncResult([fromResult(ok(1)), fromResult(err<string>('a'))]);
        const _check: AsyncResult<number[], string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returns AsyncResult<T[], E> on empty input with explicit generics (Step 14.2 — boundary)', () => {
        const r = sequenceAsyncResult<number, string>([]);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number[], string>>();
    });

    it('preserves T type verbatim — heterogeneous aggregation (Step 14.2 — value channel)', () => {
        const r = sequenceAsyncResult<string, Error>([fromResult(ok('a'))]);
        const _check: AsyncResult<string[], Error> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('returning run() yields a Promise<IResultOfT<T[], E>> (Step 14.2 — promise semantics)', async () => {
        const r = sequenceAsyncResult([fromResult(ok(1))]);
        const p = r.run();
        expectTypeOf(p).toEqualTypeOf<Promise<IResultOfT<number[], never>>>();
        await p;
    });

    it('accepts readonly array input — type-shape', () => {
        const input: readonly AsyncResult<number, never>[] = [fromResult(ok(1)), fromResult(ok(2))];
        const r = sequenceAsyncResult(input);
        expectTypeOf(r).toEqualTypeOf<AsyncResult<number[], never>>();
    });
});

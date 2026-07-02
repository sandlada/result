import { describe, it, expect } from 'vitest';
import { Result } from './src/Result.js';
import { Option } from './src/Option.js';
import { AsyncResult } from './src/promise/AsyncResult.js';
import { AsyncOption } from './src/promise/AsyncOption.js';
import { IResultOfT } from './src/IResultOfT.js';

describe('Deep Review Fixes', () => {
    describe('Flattening', () => {
        it('Result.flatten', () => {
            expect(Result.Success(Result.Success(1)).flatten().unwrapOr(0)).toBe(1);
            expect(Result.Success(Result.Failure(new Error('inner'))).flatten().isFailure).toBe(true);
            expect(Result.Failure<IResultOfT<number>>(new Error('outer')).flatten().isFailure).toBe(true);
        });

        it('Option.flatten', () => {
            expect(Option.Some(Option.Some(1)).flatten().unwrapOr(0)).toBe(1);
            expect(Option.Some(Option.None()).flatten().isNone).toBe(true);
            expect(Option.None().flatten().isNone).toBe(true);
        });

        it('AsyncResult.flatten', async () => {
            const ar = AsyncResult.Success(AsyncResult.Success(1));
            expect(await ar.flatten().unwrapOr(0)).toBe(1);
        });
    });

    describe('Error Mapping & Safety', () => {
        it('AsyncResult.mapAsync with errorFn', async () => {
            const ar = AsyncResult.Success(1).mapAsync(
                async () => { throw 'fail'; },
                (e) => new Error(`mapped: ${e}`)
            );
            const r = await ar;
            if (r.isFailure) expect(r.error.message).toBe('mapped: fail');
        });

        it('AsyncResult.tap switches to failure on throw', async () => {
            const ar = AsyncResult.Success(1).tap(() => { throw new Error('tap fail'); });
            const r = await ar;
            expect(r.isFailure).toBe(true);
        });

        it('AsyncOption.tap switches to None on throw', async () => {
            const ao = AsyncOption.Some(1).tap(() => { throw new Error('tap fail'); });
            const o = await ao;
            expect(o.isNone).toBe(true);
        });

        it('AsyncOption.FromPromise handles rejection', async () => {
            const ao = AsyncOption.FromPromise(Promise.reject('boom'));
            const o = await ao;
            expect(o.isNone).toBe(true);
        });
    });
});

import { describe, it, expect, vi } from 'vitest';
import { asyncMap } from './index.js';
import { ok, err } from '../factories/index.js';

describe('asyncMap', () => {
    it('maps success value with async callback (curried)', async () => {
        const double = asyncMap(async (x: number) => x * 2);
        const r = await double(ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('maps success value with async callback (direct)', async () => {
        const r = await asyncMap(async (x: number) => x * 2, ok(21));
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('passes through failure', async () => {
        const r = await asyncMap(async (x: number) => x * 2, err<string>('fail'));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('fail');
    });

    it('catches callback exceptions', async () => {
        const r = await asyncMap(async () => { throw 'callback err'; }, ok(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('callback err');
    });

    it('catches synchronous throws in callback', async () => {
        const r = await asyncMap(() => { throw new Error('sync err'); }, ok(1));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBeInstanceOf(Error);
    });

    it('does not invoke the mapper on an Err source', async () => {
        const mapper = vi.fn(async (x: number) => x * 2);
        const r = await asyncMap(mapper, err<string>('fail'));
        expect(mapper).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
    });

    it('passes Err through without invoking the mapper (sync input)', async () => {
        // The lift family works on sync IResultOfT; an Err source short-
        // circuits BEFORE the async mapper is awaited.
        const mapper = vi.fn(async (x: number) => x * 2);
        const r = await asyncMap(mapper, err<string>('pre-fail'));
        expect(mapper).not.toHaveBeenCalled();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('pre-fail');
    });

    it('starts eagerly — async work begins synchronously on construction', () => {
        // The implementation does `f(r.value).then(...)`. Calling the lift
        // with an Ok source starts the inner Promise chain right away, even
        // before `await` is invoked. The mapper is invoked synchronously.
        let invokedSync = false;
        const mapper = () => {
            invokedSync = true;
            return Promise.resolve(42);
        };
        const result = asyncMap(mapper, ok(21));
        expect(invokedSync).toBe(true);
        expect(result).toBeInstanceOf(Promise);
    });

    it('preserves the input E type when passing through Err (no widening on failure)', async () => {
        // The lift family keeps `E` unchanged on the failure branch (it
        // is the input's E that flows through). The widening `E | F` only
        // applies to APIs like `asyncBindThrough` whose callback can
        // introduce a fresh `F`.
        type CustomErr = { kind: 'NotFound'; id: string };
        const r = await asyncMap(async (x: number) => x * 2, err<CustomErr>({ kind: 'NotFound', id: 'x' }));
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            const e = r.error as CustomErr;
            expect(e.kind).toBe('NotFound');
            expect(e.id).toBe('x');
        }
    });
});

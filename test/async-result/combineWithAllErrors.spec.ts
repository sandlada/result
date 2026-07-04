import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { combineWithAllErrors } from '../../src/async-result/combineWithAllErrors.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';

describe('AsyncResult combineWithAllErrors', () => {
    it('combines all success values into an array when all succeed', async () => {
        const ar = combineWithAllErrors([fromResult(ok(1)), fromResult(ok(2)), fromResult(ok(3))]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([1, 2, 3]);
    });

    it('collects all errors when some fail (no short-circuit)', async () => {
        const ar = combineWithAllErrors([
            fromResult(ok(1)),
            fromResult(err('fail-a')),
            fromResult(ok(3)),
            fromResult(err('fail-b')),
        ]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) {
            expect(result.error).toHaveLength(2);
            expect(result.error).toEqual(['fail-a', 'fail-b']);
        }
    });

    it('collects all errors when every result fails', async () => {
        const e1 = new Error('e1');
        const e2 = new Error('e2');
        const ar = combineWithAllErrors([
            fromResult(err<number, Error>(e1)),
            fromResult(err<number, Error>(e2)),
        ]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) {
            expect(result.error).toHaveLength(2);
            expect(result.error).toEqual([e1, e2]);
        }
    });

    it('returns success with empty array for empty input', async () => {
        const ar = combineWithAllErrors([]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toEqual([]);
    });

    it('is lazy — does not execute until .run() is called', () => {
        let executed = false;
        const ar = combineWithAllErrors([
            { run: () => { executed = true; return Promise.resolve(ok(1)); } },
        ]);
        expect(executed).toBe(false); // not called yet
        expect(ar).toBeDefined();
    });

    it('works with structured error types', async () => {
        type VErr = { field: string; message: string };
        const ar = combineWithAllErrors<string, VErr>([
            fromResult(ok('valid') as unknown as IResultOfT<string, VErr>),
            fromResult(err<string, VErr>({ field: 'name', message: 'required' })),
            fromResult(err<string, VErr>({ field: 'email', message: 'invalid' })),
        ]);
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) {
            expect(result.error).toHaveLength(2);
            expect(result.error[0]!.field).toBe('name');
            expect(result.error[1]!.field).toBe('email');
        }
    });
});

import { describe, it, expect } from 'vitest';
import { ok, err } from '../../src/factories/index.js';
import { fromResult } from '../../src/async-result/fromResult.js';
import { orTee } from '../../src/async-result/orTee.js';

describe('AsyncResult orTee', () => {
    it('calls fn on failure and passes original result through', async () => {
        const sideEffects: string[] = [];
        const ar = orTee((e: string) => { sideEffects.push(e); }, fromResult(err('fail')));
        const result = await ar.run();
        expect(sideEffects).toEqual(['fail']);
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('ignores fn return value on failure', async () => {
        const ar = orTee((_e: string) => ok('ignored'), fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('ignores fn error on failure', async () => {
        const ar = orTee((_e: string) => err('ignored-error'), fromResult(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('does not call fn on success', async () => {
        let called = false;
        const ar = orTee((_e: string) => { called = true; }, fromResult(ok(42)));
        await ar.run();
        expect(called).toBe(false);
    });

    it('is curried', async () => {
        const sideEffects: string[] = [];
        const tee = orTee((e: string) => { sideEffects.push(e); });
        const ar = tee(fromResult(err('whoops')));
        await ar.run();
        expect(sideEffects).toEqual(['whoops']);
    });

    it('supports async side-effect', async () => {
        const sideEffects: string[] = [];
        const ar = orTee(async (e: string) => { sideEffects.push(e); }, fromResult(err('async-fail')));
        await ar.run();
        expect(sideEffects).toEqual(['async-fail']);
    });
    it('converts to err when fn throws', async () => {
        const ar = orTee(() => { throw new Error('side-effect failed'); }, fromResult(err<string>('original')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });
    it('converts to err when async fn rejects', async () => {
        const ar = orTee(async () => { throw new Error('async side-effect failed'); }, fromResult(err<string>('original')));
        const result = await ar.run();
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('async side-effect failed');
    });
});

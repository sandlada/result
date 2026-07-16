import { describe, it, expect } from 'vitest';
import { from } from '../../src/async-result/from.js';
import { ok, err } from '../../src/factories/index.js';

describe('AsyncResult from', () => {
    it('creates an AsyncResult from a thunk', async () => {
        const ar = from(() => Promise.resolve(ok(42)));
        const result = await ar.run();
        expect(result.isSuccess).toBe(true);
        if(result.isSuccess) expect(result.value).toBe(42);
    });

    it('propagates error from the thunk', async () => {
        const ar = from(() => Promise.resolve(err('fail')));
        const result = await ar.run();
        expect(result.isSuccess).toBe(false);
        if(!result.isSuccess) expect(result.error).toBe('fail');
    });

    it('is lazy — thunk is not called until run()', () => {
        let called = false;
        const ar = from(() => {
            called = true;
            return Promise.resolve(ok('done'));
        });
        expect(called).toBe(false);
    });

    it('is lazy — thunk is called on run()', async () => {
        let called = false;
        const ar = from(() => {
            called = true;
            return Promise.resolve(ok('done'));
        });
        await ar.run();
        expect(called).toBe(true);
    });
});

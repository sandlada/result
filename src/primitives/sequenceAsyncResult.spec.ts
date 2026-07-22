import { describe, it, expect } from 'vitest';
import { ok, err } from '../index.js';
import { fromResult } from '../async-result/index.js';
import { sequenceAsyncResult } from './index.js';

describe('sequenceAsyncResult', () => {
    it('combines an array of AsyncResults', async () => {
        const r = await sequenceAsyncResult([fromResult(ok(1)), fromResult(ok(2))]).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual([1, 2]);
    });

    it('short-circuits on first failure', async () => {
        const r = await sequenceAsyncResult([
            fromResult(ok(1)),
            fromResult(err<string>('a')),
            fromResult(ok(2)),
        ]).run();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('a');
    });

    it('does not run any thunk until .run() is called', () => {
        let called = 0;
        const ar = {
            run: () => {
                called++;
                return Promise.resolve(ok(1));
            },
        };
        const wrapped = sequenceAsyncResult([ar]);
        expect(called).toBe(0);
    });
});
import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr, tapAsync } from '../../src/index.js';

describe('tapAsync', () => {
    it('calls side-effect on success', async () => {
        let side = 0;
        const r = await tapAsync((v: number) => { side = v; }, asyncOk(5));
        expect(side).toBe(5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('does not call on failure', async () => {
        let side = 0;
        await tapAsync((v: number) => { side = v; }, asyncErr<string>('err'));
        expect(side).toBe(0);
    });

    it('catches callback throw and converts to Err', async () => {
        const r = await tapAsync(
            () => { throw new Error('boom'); },
            asyncOk<number, string>(5),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('boom');
    });

    it('catches async callback rejection and converts to Err', async () => {
        const r = await tapAsync(
            async () => { throw new Error('async-boom'); },
            asyncOk<number, string>(5),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('async-boom');
    });

    it('curried: returns a function to apply later', async () => {
        let called = false;
        const fn = tapAsync<number, string>(() => { called = true; });
        const r = await fn(asyncOk(7));
        expect(called).toBe(true);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(7);
    });
});

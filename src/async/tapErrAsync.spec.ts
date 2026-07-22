import { describe, it, expect } from 'vitest';
import { asyncErr, asyncOk, tapErrAsync } from '../../src/index.js';

describe('tapErrAsync', () => {
    it('calls side-effect on failure', async () => {
        let side = '';
        const r = await tapErrAsync((e: string) => { side = e; }, asyncErr<string>('oops'));
        expect(side).toBe('oops');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('oops');
    });

    it('does not call side-effect on success and forwards the result', async () => {
        let called = false;
        const r = await tapErrAsync(() => { called = true; }, asyncOk<number, string>(42));
        expect(called).toBe(false);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('catches callback throw and converts to Err(callback error)', async () => {
        const r = await tapErrAsync(
            () => { throw new Error('side-effect failed'); },
            asyncErr<string>('original'),
        );
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect((r.error as Error).message).toBe('side-effect failed');
    });

    it('curried: returns a function that can be applied later', async () => {
        let side: string | undefined;
        const tapper = tapErrAsync((e: string) => { side = e; });
        const r = await tapper(asyncErr<string>('curried'));
        expect(side).toBe('curried');
        expect(r.isFailure).toBe(true);
    });
});

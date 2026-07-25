import { describe, it, expect } from 'vitest';
import { asyncOk, asyncErr } from '../../factories/index.js';
import { bindAsync, orElseAsync, tapAsync, tapErrAsync } from '../../promise-result/index.js';

describe('Result async hardening', () => {
    describe('eager operators', () => {
        it('bindAsync propagates callback error (does not catch)', async () => {
            await expect(bindAsync(() => { throw new Error('boom'); }, asyncOk(42))).rejects.toThrow('boom');
        });

        it('orElseAsync propagates callback error (does not catch)', async () => {
            await expect(orElseAsync(() => { throw new Error('boom'); }, asyncErr('error'))).rejects.toThrow('boom');
        });

        it('tapAsync should catch callback error and turn to failure', async () => {
            const r = await tapAsync(() => { throw new Error('boom'); }, asyncOk(42));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect((r.error as Error).message).toBe('boom');
        });

        it('tapErrAsync should catch callback error and turn to failure', async () => {
            // If original was failure, it remains failure but maybe with the new error if we want hardening.
            // Current implementation for tapErrAsync returns Failure with the new error.
            const r = await tapErrAsync(() => { throw new Error('boom'); }, asyncErr('original'));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect((r.error as Error).message).toBe('boom');
        });
    });
});

import { describe, it, expect } from 'vitest';
import { ok, err, asyncOk, asyncErr, bindAsync, orElseAsync, tapAsync, tapErrAsync } from '../../src/index.js';

describe('Result async hardening', () => {
    describe('eager operators', () => {
        it('bindAsync should catch callback error', async () => {
            const r = await bindAsync(() => { throw new Error('boom'); }, asyncOk(42));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect((r.error as Error).message).toBe('boom');
        });

        it('orElseAsync should catch callback error', async () => {
            const r = await orElseAsync(() => { throw new Error('boom'); }, asyncErr('error'));
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect((r.error as Error).message).toBe('boom');
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

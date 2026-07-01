import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

describe('Error always accessible', () => {
    it('success result error does not throw', () => {
        const ok = Result.Success();
        expect(() => ok.error).not.toThrow();
    });

    it('typed success result error does not throw', () => {
        const ok = Result.Success(42);
        expect(() => ok.error).not.toThrow();
    });

    it('failure result error does not throw', () => {
        const err = Result.Failure(new Error('fail'));
        expect(() => err.error).not.toThrow();
    });
});

describe('Sentinel vs real error', () => {
    it('success result error is the sentinel value', () => {
        const ok = Result.Success();
        expect(ok.error).not.toBeInstanceOf(Error);
    });

    it('failure result error is the actual error', () => {
        const error = new Error('specific error');
        const err = Result.Failure(error);
        expect(err.error).toBe(error);
    });

    it('failure result error preserves custom properties', () => {
        const err = Result.Failure({ code: 500, reason: 'Internal' });
        expect(err.error.code).toBe(500);
        expect(err.error.reason).toBe('Internal');
    });
});

describe('Check isSuccess before interpreting error', () => {
    it('consumer pattern: only read error when isFailure', () => {
        function handleError(r: { isSuccess: boolean; error: unknown }) {
            if (!r.isSuccess) {
                return String(r.error);
            }
            return 'ok';
        }

        const success = Result.Success();
        const failure = Result.Failure(new Error('boom'));

        expect(handleError(success)).toBe('ok');
        expect(handleError(failure)).toContain('boom');
    });

    it('failure error retains identity across references', () => {
        const original = new Error('original');
        const err = Result.Failure(original);
        expect(err.error).toBe(original);
    });
});

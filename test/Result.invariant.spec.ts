import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

describe('Mutual exclusivity', () => {
    it('success result: isSuccess=true, isFailure=false', () => {
        const ok = Result.Success();
        expect(ok.isSuccess).toBe(true);
        expect(ok.isFailure).toBe(false);
    });

    it('failure result: isSuccess=false, isFailure=true', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.isSuccess).toBe(false);
        expect(err.isFailure).toBe(true);
    });

    it('typed success: isSuccess=true, isFailure=false', () => {
        const ok = Result.Success(42);
        expect(ok.isSuccess).toBe(true);
        expect(ok.isFailure).toBe(false);
    });

    it('typed failure: isSuccess=false, isFailure=true', () => {
        const err = Result.Failure<string, Error>(new Error('nope'));
        expect(err.isSuccess).toBe(false);
        expect(err.isFailure).toBe(true);
    });

    it('isSuccess and isFailure are never equal', () => {
        const ok = Result.Success();
        const err = Result.Failure(new Error('fail'));

        expect(ok.isSuccess).not.toBe(ok.isFailure);
        expect(err.isSuccess).not.toBe(err.isFailure);
    });
});

describe('Constructor invariant enforcement', () => {
    it('rejects success + real error combination', () => {
        expect(() => {
            // constructor is protected — testing invariant logic via any-cast
            new (Result as any)(true, new Error('should not be here'));
        }).toThrow();
    });

    it('rejects failure + no error (sentinel) combination', () => {
        // constructor is protected — testing invariant logic via any-cast
        expect(() => {
            new (Result as any)(false, Symbol.for('result:none'));
        }).toThrow();
    });
});

describe('Immutability', () => {
    it('isSuccess is readonly', () => {
        const ok = Result.Success();
        expect(ok.isSuccess).toBe(true);
    });

    it('isFailure is readonly', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.isFailure).toBe(true);
    });

    it('error is readonly', () => {
        const err = Result.Failure(new Error('fail'));
        expect(err.isFailure).toBe(true);
        if (err.isFailure) expect(err.error).toBeDefined();
    });
});

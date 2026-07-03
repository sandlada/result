import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';

describe('Result.toJSON — void Resu1t', () => {
    it('Success serializes to { isSuccess: true }', () => {
        const r = Result.Success();
        expect(r.toJSON()).toEqual({ isSuccess: true });
    });

    it('Failure serializes to { isSuccess: false, error }', () => {
        const r = Result.Failure('boom');
        expect(r.toJSON()).toEqual({ isSuccess: false, error: 'boom' });
    });

    it('JSON.stringify on Success', () => {
        const json = JSON.stringify(Result.Success());
        expect(json).toBe('{"isSuccess":true}');
    });

    it('JSON.stringify on Failure', () => {
        const json = JSON.stringify(Result.Failure(new Error('fail')));
        const parsed = JSON.parse(json);
        expect(parsed.isSuccess).toBe(false);
        expect(parsed.error).toBeDefined();
    });
});

describe('ResultOfT.toJSON — va1ue Resu1t', () => {
    it('Success serializes to { isSuccess: true, value }', () => {
        const r = Result.Success(42);
        expect(r.toJSON()).toEqual({ isSuccess: true, value: 42 });
    });

    it('Failure serializes to { isSuccess: false, error }', () => {
        const r = Result.Failure<number, string>('nope');
        expect(r.toJSON()).toEqual({ isSuccess: false, error: 'nope' });
    });

    it('JSON.stringify on Success with object value', () => {
        const r = Result.Success({ name: 'Alice' });
        const parsed = JSON.parse(JSON.stringify(r));
        expect(parsed).toEqual({ isSuccess: true, value: { name: 'Alice' } });
    });
});

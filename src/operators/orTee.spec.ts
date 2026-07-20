import { describe, it, expect } from 'vitest';
import { ok, err, orTee } from '../../src/index.js';

describe('orTee', () => {
    it('curried: calls fn and passes original result through on failure', () => {
        let side = '';
        const tee = orTee((e: string) => { side = e; return ok('ignored'); });
        const result = tee(err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('direct: calls fn and passes original result through on failure', () => {
        let side = '';
        const result = orTee((e: string) => { side = e; return ok('ignored'); }, err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('ignores fn success and preserves original failure', () => {
        const result = orTee((_e: string) => ok(42), err<string>('boom'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });

    it('does NOT call fn on success', () => {
        let called = false;
        const result = orTee(() => { called = true; return ok('ignored'); }, ok(42));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('handles fn returning failure gracefully', () => {
        let side = '';
        const result = orTee((e: string) => { side = e; return err('inner'); }, err('boom'));
        expect(side).toBe('boom');
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('boom');
    });
    it('converts to err when fn throws', () => {
        const result = orTee(() => { throw new Error('side-effect failed'); }, err<string>('original'));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });
});

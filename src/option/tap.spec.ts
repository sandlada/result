import { describe, it, expect } from 'vitest';
import { ofSome, ofNone, tapOption } from '../../src/index.js';

describe('tapOption', () => {
    it('calls fn with the value on Some', () => {
        let sideEffect = '';
        const result = tapOption((v: string) => {
            sideEffect = v;
        })(ofSome('hello'));
        expect(sideEffect).toBe('hello');
        if (result.isSome) expect(result.value).toBe('hello');
    });

    it('returns the same None', () => {
        let called = false;
        const result = tapOption(() => {
            called = true;
        })(ofNone());
        expect(called).toBe(false);
        expect(result.isSome).toBe(false);
    });

    it('converts to None when fn throws', () => {
        const result = tapOption(() => { throw new Error('boom'); })(ofSome('hello'));
        expect(result.isNone).toBe(true);
    });
});

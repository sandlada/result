import { describe, it, expect, vi } from 'vitest';
import { tap, ofSome, ofNone } from './index.js';

describe('tap', () => {
    it('calls fn with the value on Some', () => {
        let sideEffect = '';
        const result = tap((v: string) => {
            sideEffect = v;
        })(ofSome('hello'));
        expect(sideEffect).toBe('hello');
        if (result.isSome) expect(result.value).toBe('hello');
    });

    it('returns the same None', () => {
        const mockFn = vi.fn();
        const result = tap(mockFn)(ofNone());
        expect(mockFn).not.toHaveBeenCalled();
        expect(result.isSome).toBe(false);
    });

    it('converts to None when fn throws', () => {
        const mockFn = vi.fn().mockImplementation(() => {
            throw new Error('boom');
        });
        const result = tap(mockFn)(ofSome('hello'));
        expect(mockFn).toHaveBeenCalledWith('hello');
        expect(result.isNone).toBe(true);
        expect(result).toEqual(ofNone());
    });
});

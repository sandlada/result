import { describe, it, expect } from 'vitest';
import { condErr } from './index.js';

describe('condErr', () => {
    it('Err(errorOnTrue) when predicate is true', () => {
        const r = condErr((s: string) => s.includes('@'), 'alice@x', 'invalid email');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('invalid email');
    });

    it('Ok(okValue) when predicate is false', () => {
        const r = condErr((s: string) => s.includes('@'), 'no-at', 'invalid email');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('no-at');
    });
});
import { describe, it, expect } from 'vitest';
import { cond } from './index.js';

describe('cond', () => {
    it('Ok(value) when predicate is true', () => {
        const r = cond((n: number) => n > 0, 'must be positive', 5);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(5);
    });

    it('Err(errorOnFalse) when predicate is false', () => {
        const r = cond((n: number) => n > 0, 'must be positive', -1);
        expect(r.isFailure).toBe(true);
        if (r.isFailure) expect(r.error).toBe('must be positive');
    });

    it('still passes the original value through on success', () => {
        const original = { id: 7, label: 'ok' };
        const r = cond((v: typeof original) => v.id > 0, 'bad id', original);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(original);
    });
});
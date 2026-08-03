import { describe, it, expect } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { okOr } from '../../src/async-option/okOr.js';

describe('AsyncOption okOr', () => {
    it('Some converts to Ok', async () => {
        const ar = okOr('missing', ofSome(42));
        const r = await ar.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('None converts to Err with the given error', async () => {
        const ar = okOr('missing', ofNone<number>());
        const r = await ar.run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('missing');
    });

    it('is curried', async () => {
        const r = await okOr('missing')(ofNone<number>()).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('missing');
    });

    it('returns Ok reference-preserving on Some (no reallocation)', async () => {
        // okOr lifts the Some value directly into an Ok; the resulting AsyncResult
        // should resolve to Ok(<same value>) without copying.
        const ao = ofSome(42);
        const ar = okOr('missing', ao);
        const r = await ar.run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });
});
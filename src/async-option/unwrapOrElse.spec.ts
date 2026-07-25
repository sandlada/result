import { describe, it, expect, vi } from 'vitest';
import { ofSome } from '../../src/async-option/ofSome.js';
import { ofNone } from '../../src/async-option/ofNone.js';
import { unwrapOrElse } from '../../src/async-option/unwrapOrElse.js';

describe('AsyncOption unwrapOrElse', () => {
    it('returns the value on Some without calling onNone', async () => {
        const onNone = vi.fn(() => 0);
        const v = await unwrapOrElse(onNone, ofSome(42));
        expect(v).toBe(42);
        expect(onNone).not.toHaveBeenCalled();
    });

    it('calls onNone on None (sync)', async () => {
        const v = await unwrapOrElse(() => 0, ofNone<number>());
        expect(v).toBe(0);
    });

    it('awaits async onNone', async () => {
        const v = await unwrapOrElse(async () => 99, ofNone<number>());
        expect(v).toBe(99);
    });

    it('is curried', async () => {
        const v = await unwrapOrElse(() => -1)(ofNone<number>());
        expect(v).toBe(-1);
    });
});
import { describe, it, expect } from 'vitest';
import type { IResult } from '../../src/types/IResult.js';
import type { IResultOfT } from '../../src/types/IResultOfT.js';
import { ok } from './index.js';

// ─── ok() — void success ───────────────────────────────────────────────────

describe('ok()', () => {
    it('returns a success result', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
    });

    it('has isFailure === false', () => {
        const r = ok();
        expect(r.isFailure).toBe(false);
    });

    it('returns an object conforming to IResult', () => {
        const r: IResult = ok();
        expect(r).toBeDefined();
    });

    it('ok() with no argument creates a void success', () => {
        const result = ok();
        expect(result.isSuccess).toBe(true);
        expect(result.isFailure).toBe(false);
    });

    it('ok() does not carry a value key on the success variant', () => {
        // The success branch of IResult (IResultSuccess) does not declare `value`.
        // Document the runtime contract: ok() returns an object whose success
        // branch is structurally { isSuccess: true, isFailure: false } with
        // no `value` key present.
        const r = ok();
        expect(r).not.toHaveProperty('value');
        // The runtime keys reflect the same shape.
        expect(Object.keys(r).sort()).toEqual(['isFailure', 'isSuccess']);
    });

    it('ok() is type-compatible with IResult<never> but not with IResultOfT<*, never>', () => {
        // The runtime value carries only the discriminator pair — at the type
        // level it conforms to IResult (no value required).
        const r: IResult = ok();
        expect(r.isSuccess).toBe(true);
        // Casting to IResultOfT at the runtime layer is possible because the
        // value-bearing variant is structurally a superset of the void variant;
        // the public type-level contract is intentionally narrower though.
        const _widened: IResultOfT<undefined, never> = ok() as IResultOfT<undefined, never>;
        expect(_widened.isSuccess).toBe(true);
    });
});

// ─── ok<T>(value) — value success ──────────────────────────────────────────

describe('ok<T>(value)', () => {
    it('returns a success result carrying a value', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);
    });

    it('infers the value type from the argument', () => {
        const r = ok({ id: 1, name: 'Alice' });
        if (r.isSuccess) {
            expect(r.value.name).toBe('Alice');
            expect(r.value.id).toBe(1);
        }
    });

    it('works with null value', () => {
        const r = ok<number | null>(null);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeNull();
    });

    it('works with undefined value', () => {
        const r = ok<number | undefined>(undefined);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBeUndefined();
    });

    it('ok(undefined) creates a success with undefined value', () => {
        const result = ok<number | undefined>(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeUndefined();
    });

    it('ok(null) creates a success with null value', () => {
        const result = ok<number | null>(null);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });

    it('ok(undefined) carries a value key on the success variant', () => {
        // The value-bearing overload keeps `value` on the success branch even
        // when the value is `undefined` — this is what `arguments.length`
        // discrimination preserves at runtime.
        const r = ok<undefined>(undefined);
        expect(r).toHaveProperty('value');
        expect((r as { value: unknown }).value).toBeUndefined();
    });

    it('preserves literal-type strings when given a literal argument', () => {
        const r = ok('exact' as const);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('exact');
    });

    it('preserves complex nested objects', () => {
        const payload = { user: { id: 7, tags: ['a', 'b'] }, count: 2 };
        const r = ok(payload);
        if (r.isSuccess) {
            expect(r.value.user.id).toBe(7);
            expect(r.value.user.tags).toEqual(['a', 'b']);
            expect(r.value.count).toBe(2);
        }
    });

    it('preserves array values without unwrapping', () => {
        const r = ok([1, 2, 3]);
        if (r.isSuccess) expect(r.value).toEqual([1, 2, 3]);
    });
});

// ─── ok consistency ────────────────────────────────────────────────────────

describe('ok consistency', () => {
    it('ok<T>(val) produces isSuccess: true, isFailure: false', () => {
        const r = ok(42);
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('ok() produces isSuccess: true, isFailure: false for void', () => {
        const r = ok();
        expect(r.isSuccess).toBe(true);
        expect(r.isFailure).toBe(false);
    });

    it('FP operator form: ok(42) is a success', () => {
        expect(ok(42).isSuccess).toBe(true);
    });

    it('FP operator form: ok() is a success', () => {
        expect(ok().isSuccess).toBe(true);
    });

    it('many ok() invocations produce independent objects', () => {
        const a = ok();
        const b = ok();
        expect(a).not.toBe(b);
        expect(a.isSuccess).toBe(true);
        expect(b.isSuccess).toBe(true);
    });
});
import { describe, it, expect, vi, expectTypeOf } from 'vitest';
import { catchErr } from './catchErr.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

interface Config {
    settings: { theme: string };
}
interface DefaultObj {
    kind: 'Default';
    reason: string;
}

describe('catchErr', () => {
    it('returns original Ok if the result is successful (direct)', () => {
        const result = catchErr((e: string) => 0, ok(42));
        expect(result).toEqual(ok(42));
    });

    it('returns original Ok if the result is successful (curried)', () => {
        const recover = catchErr((e: string) => 0);
        const result = recover(ok(42));
        expect(result).toEqual(ok(42));
    });

    it('converts Err to Ok with the recovered value (direct)', () => {
        const result = catchErr((e: string) => 0, err('boom'));
        expect(result).toEqual(ok(0));
    });

    it('converts Err to Ok with the recovered value (curried)', () => {
        const recover = catchErr((e: string) => e.length);
        const result = recover(err('boom'));
        expect(result).toEqual(ok(4));
    });

    it('does NOT call onErr on success (Group C)', () => {
        const onErr = vi.fn((_e: string) => 0);
        catchErr(onErr, ok(42));
        expect(onErr).toHaveBeenCalledTimes(0);
    });

    it('calls onErr exactly once on failure (Group C)', () => {
        const onErr = vi.fn((_e: string) => 0);
        catchErr(onErr, err('boom'));
        expect(onErr).toHaveBeenCalledTimes(1);
    });

    // ── Cross-shape recovery: B may differ from A (regression for the bug). ────

    it('handler may return a structurally different shape (curried)', () => {
        const configResult: IResultOfT<Config, string> = ok({ settings: { theme: 'dark' } });
        const fallback: DefaultObj = { kind: 'Default', reason: 'no config' };
        const recover = catchErr<DefaultObj, string>((e) => fallback);
        // On success, A passes through.
        const r = recover(configResult);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toEqual({ settings: { theme: 'dark' } });
    });

    it('handler may return a structurally different shape on failure (curried)', () => {
        const configResult: IResultOfT<Config, string> = err('missing');
        const fallback: DefaultObj = { kind: 'Default', reason: 'missing' };
        const recover = catchErr<DefaultObj, string>((e) => ({ kind: 'Default' as const, reason: e }));
        const r = recover(configResult);
        // type level: IResultOfT<Config | DefaultObj, never>
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | DefaultObj, never>>();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<Config | DefaultObj>();
            expect(r.value).toEqual({ kind: 'Default', reason: 'missing' });
        }
    });

    it('handler returns a different shape on failure (direct)', () => {
        const configResult: IResultOfT<Config, string> = err('missing');
        const r = catchErr<Config, DefaultObj, string>(
            (e) => ({ kind: 'Default' as const, reason: e }),
            configResult,
        );
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | DefaultObj, never>>();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<Config | DefaultObj>();
            expect(r.value).toEqual({ kind: 'Default', reason: 'missing' });
        }
    });

    it('curried return widens A | B; deferred inner <A> lets each call site pick its own A', () => {
        const recover = catchErr<DefaultObj, string>((e) => ({ kind: 'Default' as const, reason: e }));
        const r1 = recover(ok<Config>({ settings: { theme: 'dark' } }));
        const r2 = recover(ok<number>(42));
        expectTypeOf(r1).toEqualTypeOf<IResultOfT<Config | DefaultObj, never>>();
        expectTypeOf(r2).toEqualTypeOf<IResultOfT<number | DefaultObj, never>>();
        if (r1.isSuccess) expectTypeOf(r1.value).toEqualTypeOf<Config | DefaultObj>();
        if (r2.isSuccess) expectTypeOf(r2.value).toEqualTypeOf<number | DefaultObj>();
    });

    it('number fallback is independent of string input (direct)', () => {
        const r = catchErr<number, string, Error>(
            (e) => e.message.length,
            err<string, Error>(new Error('boom')),
        );
        expectTypeOf(r).toEqualTypeOf<IResultOfT<number | string, never>>();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('boom'.length);
    });

    it('error track collapses to `never` on the recovered branch (full result type)', () => {
        const r1 = catchErr((e: string) => 'recovered' as const, err<string>('boom'));
        const r2 = catchErr((e: string) => 'recovered' as const, ok<number>(42));
        expectTypeOf(r1).toEqualTypeOf<IResultOfT<number | 'recovered', never>>();
        expectTypeOf(r2).toEqualTypeOf<IResultOfT<number | 'recovered', never>>();
        // Both produce carriers that, by structural narrowing of the discriminator,
        // expose only the success track.
        expect(r1.isFailure).toBe(false);
        expect(r2.isFailure).toBe(false);
    });
});

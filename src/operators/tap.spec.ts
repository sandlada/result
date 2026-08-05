import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { tap } from './index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('tap', () => {
    it('curried: side-effect called on success, original returned', () => {
        let side: number | undefined;
        const tapper = tap((v: number) => { side = v; });
        const result = tapper(ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });
    it('direct: side-effect called on success', () => {
        let side: number | undefined;
        const result = tap((v: number) => { side = v; }, ok(42));
        expect(side).toBe(42);
        expect(result.isSuccess).toBe(true);
    });
    it('failure: side-effect NOT called', () => {
        let called = false;
        const result = tap(() => { called = true; }, err<string>('bad'));
        expect(called).toBe(false);
        expect(result.isSuccess).toBe(false);
    });
    it('calls fn on success (phase5c form)', () => {
        let called = false;
        const result = tap(() => { called = true; }, ok() as unknown as IResultOfT<unknown, never>);
        expect(called).toBe(true);
        expect(result.isSuccess).toBe(true);
    });
    it('does not call fn on failure (phase5c form)', () => {
        let called = false;
        tap(() => { called = true; }, err(new Error('nope')));
        expect(called).toBe(false);
    });
    it('converts to err when fn throws', () => {
        const result = tap(() => { throw new Error('side-effect failed'); }, ok(42));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect((result.error as Error).message).toBe('side-effect failed');
    });

    it('counts exactly one invocation on success (Group C)', () => {
        const fn = vi.fn((_v: number) => undefined);
        tap(fn, ok(1));
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('counts zero invocations on failure (Group C)', () => {
        const fn = vi.fn((_v: number) => undefined);
        tap(fn, err<string>('e'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('curried form — zero invocations on failure (Group C)', () => {
        const fn = vi.fn((_v: number) => undefined);
        tap(fn)(err<string>('e'));
        expect(fn).toHaveBeenCalledTimes(0);
    });

    it('converts non-Error throw to err(caught) (Group D)', () => {
        const result = tap((_v: number) => { throw 'string-throw'; }, ok(1));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) expect(result.error).toBe('string-throw');
    });

    it('uses errorFn to customise throw payload (curried)', () => {
        const result = tap(
            (_v: number) => { throw 'string-throw'; },
            (t: unknown) => ({ kind: 'SideEffect', payload: String(t) }) as { kind: 'SideEffect'; payload: string },
        )(ok(1));
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.kind).toBe('SideEffect');
            expect(result.error.payload).toBe('string-throw');
        }
    });

    it('uses errorFn to customise throw payload (direct)', () => {
        const result = tap(
            (_v: number) => { throw 'string-throw'; },
            ok(1),
            (t: unknown) => ({ kind: 'SideEffect', payload: String(t) }) as { kind: 'SideEffect'; payload: string },
        );
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.kind).toBe('SideEffect');
            expect(result.error.payload).toBe('string-throw');
        }
    });
});


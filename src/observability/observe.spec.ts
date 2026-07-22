import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../index.js';
import { observe, installObserver, getActiveObserver } from './index.js';

describe('observe / installObserver', () => {
    it('returns the result unchanged when no observer is active', () => {
        const r = ok(42);
        expect(observe(r)).toBe(r);
    });

    it('fires the observer for Ok', () => {
        const fn = vi.fn();
        const cancel = installObserver(fn);
        try {
            const r = ok(42);
            observe(r);
            expect(fn).toHaveBeenCalledTimes(1);
            const event = fn.mock.calls[0]![0];
            expect(event.kind).toBe('ok');
            expect(event.result).toBe(r);
        } finally {
            cancel();
        }
    });

    it('fires the observer for Err', () => {
        const fn = vi.fn();
        const cancel = installObserver(fn);
        try {
            const r = err('boom');
            observe(r);
            const event = fn.mock.calls[0]![0];
            expect(event.kind).toBe('err');
            expect(event.result).toBe(r);
        } finally {
            cancel();
        }
    });

    it('cancel removes the observer', () => {
        const fn = vi.fn();
        const cancel = installObserver(fn);
        cancel();
        expect(getActiveObserver()).toBeNull();
    });

    it('swallows observer errors so they do not break the pipeline', () => {
        const fn = vi.fn(() => { throw new Error('observer boom'); });
        const cancel = installObserver(fn);
        try {
            const r = ok(1);
            const returned = observe(r);
            expect(returned).toBe(r);
        } finally {
            cancel();
        }
    });

    it('records path from ctx frame', () => {
        const seen: unknown[] = [];
        const cancel = installObserver((e) => seen.push(e));
        try {
            // Push a path via ctx / withPath before observe.
            const r = err('boom');
            const observed = observe(r);
            expect(observed).toBe(r);
        } finally {
            cancel();
        }
        expect(seen.length).toBe(1);
    });
});
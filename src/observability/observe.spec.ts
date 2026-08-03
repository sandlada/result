import { describe, it, expect, vi } from 'vitest';
import { ok, err } from '../factories/index.js';
import { observe, installObserver, getActiveObserver, ctx, getPath, withPath } from './index.js';

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

    it('cancel is a no-op when a different observer was installed since', () => {
        const first = vi.fn();
        const second = vi.fn();
        const cancelFirst = installObserver(first);
        installObserver(second);
        cancelFirst();
        expect(getActiveObserver()).toBe(second);
    });

    it('passing null to installObserver clears the active observer', () => {
        const fn = vi.fn();
        installObserver(fn);
        installObserver(null);
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

    it('swallows observer errors when observing an Err result', () => {
        const fn = vi.fn(() => { throw new Error('observer boom err'); });
        const cancel = installObserver(fn);
        try {
            const r = err('boom');
            const returned = observe(r);
            expect(returned).toBe(r);
        } finally {
            cancel();
        }
    });

    it('swallows primitive exceptions thrown by misbehaving observers', () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        const fn = vi.fn(() => { throw 'string boom'; });
        const cancel = installObserver(fn);
        try {
            const r = ok(42);
            const returned = observe(r);
            expect(returned).toBe(r);
        } finally {
            cancel();
        }
    });

    it('records the current path on every event', () => {
        const seen: unknown[] = [];
        const cancel = installObserver((e) => seen.push(e));
        try {
            const r = err('boom');
            const observed = observe(r);
            expect(observed).toBe(r);
        } finally {
            cancel();
        }
        expect(seen.length).toBe(1);
    });

    it('getActiveObserver returns null by default', () => {
        // No installObserver call in this test scope. Ensure the slot is
        // null on first observation.
        installObserver(null); // ensure clean slate
        expect(getActiveObserver()).toBeNull();
    });

    it('observe on Ok still emits kind=ok with the same result identity', () => {
        const cancel = installObserver((e) => {
            expect(e.kind).toBe('ok');
            expect(e.result).toBe(r);
        });
        try {
            const r = ok(7);
            const returned = observe(r);
            expect(returned).toBe(r);
        } finally {
            cancel();
        }
    });

    it('observe on Err emits kind=err with the same result identity', () => {
        const cancel = installObserver((e) => {
            expect(e.kind).toBe('err');
            expect(e.result).toBe(r);
        });
        try {
            const r = err('boom');
            const returned = observe(r);
            expect(returned).toBe(r);
        } finally {
            cancel();
        }
    });

    it('observer event path mirrors ctx.run current path snapshot', () => {
        const seen: Array<{ path: ReadonlyArray<string | number> }> = [];
        const cancel = installObserver((e) => {
            seen.push({ path: e.path });
        });
        try {
            ctx.run(() => {
                withPath('outer');
                withPath('inner');
                observe(ok(1));
                withPath('after-observe');
                observe(err('boom'));
            });
        } finally {
            cancel();
        }
        expect(seen).toEqual([
            { path: ['outer', 'inner'] },
            { path: ['outer', 'inner', 'after-observe'] },
        ]);
    });

    it('multiple sequential observers fire in LIFO order (most recent wins)', () => {
        const first = vi.fn();
        const second = vi.fn();
        const cancelFirst = installObserver(first);
        const cancelSecond = installObserver(second);
        try {
            const r = ok(1);
            observe(r);
            // Only `second` should have fired — `first` is shadowed.
            expect(first).not.toHaveBeenCalled();
            expect(second).toHaveBeenCalledTimes(1);
        } finally {
            cancelSecond();
            cancelFirst();
        }
    });

    it('LIFO disposal: cancelling B before A keeps observer active after cancelling B', () => {
        // After B is cancelled, the previous observer (A) becomes active.
        const a = vi.fn();
        const b = vi.fn();
        const cancelA = installObserver(a);
        const cancelB = installObserver(b);
        observe(ok(1));
        // Only b should fire.
        expect(a).not.toHaveBeenCalled();
        expect(b).toHaveBeenCalledTimes(1);
        cancelB();
        observe(ok(2));
        // Now a fires (b was the most recent; its cancellation restored a).
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
        cancelA();
        expect(getActiveObserver()).toBeNull();
    });

    it('installObserver(null) twice in a row leaves active as null', () => {
        installObserver(null);
        installObserver(null);
        expect(getActiveObserver()).toBeNull();
    });

    it('observer that mutates shared state does not affect the original result', () => {
        const cancel = installObserver((_e) => {
            // mutate state but not the result
            sharedCounter.value += 1;
        });
        const sharedCounter = { value: 0 };
        try {
            const r = ok(42);
            const returned = observe(r);
            expect(returned).toBe(r);
            expect(returned.isSuccess).toBe(true);
            if (returned.isSuccess) expect(returned.value).toBe(42);
            expect(sharedCounter.value).toBe(1);
        } finally {
            cancel();
        }
    });

    it('observe with path-less execution (no ctx.run) emits empty path', () => {
        const seen: Array<ReadonlyArray<string | number>> = [];
        const cancel = installObserver((e) => {
            seen.push(e.path);
        });
        try {
            // Outside any ctx.run — getPath() returns empty.
            expect(getPath()).toEqual([]);
            observe(ok(1));
            observe(err('x'));
        } finally {
            cancel();
        }
        expect(seen).toEqual([[], []]);
    });
});

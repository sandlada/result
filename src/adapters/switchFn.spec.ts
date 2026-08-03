import { describe, it, expect } from 'vitest';
import { switchFn } from './index.js';

describe('switchFn', () => {
    it('wraps a normal function to return a success result', () => {
        const safeParseInt = switchFn((s: string) => Number.parseInt(s, 10));
        const result = safeParseInt('42');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('catches exceptions and returns err', () => {
        const badFn = switchFn((_s: string) => {
            throw new Error('unexpected');
        });
        const result = badFn('anything');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect((result.error as Error).message).toBe('unexpected');
    });

    it('preserves falsy return values', () => {
        const returnFalse = switchFn((_x: unknown) => false);
        const result = returnFalse(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(false);
    });

    it('preserves null return values', () => {
        const returnNull = switchFn((_x: unknown) => null);
        const result = returnNull(undefined);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBeNull();
    });

    it('uses the supplied errorFn to map caught exceptions', () => {
        const mappedFn = switchFn(
            (_s: string) => { throw new Error('raw'); },
            (e: unknown) => new Error(`mapped: ${(e as Error).message}`),
        );
        const result = mappedFn('anything');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toBe('mapped: raw');
        }
    });

    it('catches non-Error throws and returns err', () => {
        const stringThrowFn = switchFn((_s: string) => {
            throw 'string error';
        });
        const result = stringThrowFn('anything');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) expect(result.error).toBe('string error');
    });

    it('invokes the wrapped function exactly once per call', () => {
        let calls = 0;
        const track = switchFn((x: number) => {
            calls += 1;
            return x * 2;
        });
        const result = track(21);
        expect(calls).toBe(1);
        if (result.isSuccess) expect(result.value).toBe(42);
    });

    it('errorFn is invoked exactly once when the wrapped function throws', () => {
        let errorFnCalls = 0;
        let captured: unknown;
        const mappedFn = switchFn(
            (_s: string) => { throw new Error('boom'); },
            (e: unknown) => {
                errorFnCalls += 1;
                captured = e;
                return String(e);
            },
        );
        const result = mappedFn('anything');
        expect(errorFnCalls).toBe(1);
        expect(captured).toBeInstanceOf(Error);
        if (!result.isSuccess) expect(result.error).toBe('Error: boom');
    });

    it('errorFn is not invoked on success', () => {
        let errorFnCalls = 0;
        const safe = switchFn(
            (x: number) => x * 2,
            (_e: unknown) => {
                errorFnCalls += 1;
                return 'should not happen';
            },
        );
        const result = safe(21);
        expect(errorFnCalls).toBe(0);
        expect(result.isSuccess).toBe(true);
    });

    it('passes the wrapped function the exact argument received', () => {
        let received: unknown = null;
        const capture = switchFn((x: { id: number; name: string }) => {
            received = x;
            return x.id;
        });
        const arg = { id: 7, name: 'Seven' };
        const result = capture(arg);
        expect(received).toBe(arg);
        if (result.isSuccess) expect(result.value).toBe(7);
    });

    it('preserves the object reference returned by the wrapped function', () => {
        const obj = { kind: 'boxed' as const, payload: [1, 2, 3] };
        const safe = switchFn(() => obj);
        const result = safe('anything');
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) expect(result.value).toBe(obj);
    });

    it('never rethrows: all control flows stay inside the result', () => {
        const safe = switchFn((x: number) => {
            if (x < 0) throw new RangeError('negative');
            return x;
        });
        // Should not throw even when the input would have caused a throw.
        expect(() => safe(-1)).not.toThrow();
        expect(() => safe(0)).not.toThrow();
        expect(() => safe(1)).not.toThrow();
    });

    it('errorFn can return any custom shape (numeric codes, structured objects)', () => {
        type Code = { code: number; msg: string };
        const safe = switchFn(
            (_s: string) => { throw new Error('boom'); },
            (e: unknown): Code => ({ code: 500, msg: (e as Error).message }),
        );
        const result = safe('any');
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error).toEqual({ code: 500, msg: 'boom' });
        }
    });

    it('when errorFn is omitted, the raw thrown value is surfaced as the error', () => {
        const safe = switchFn((_x: number) => {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal -- intentional primitive throw
            throw { kind: 'BoxedError', detail: 'raw' };
        });
        const result = safe(42);
        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error).toEqual({ kind: 'BoxedError', detail: 'raw' });
        }
    });

    it('the produced function is independent per switchFn call (closes over its own f)', () => {
        const inc = switchFn((x: number) => x + 1);
        const dec = switchFn((x: number) => x - 1);
        const incResult = inc(10);
        const decResult = dec(10);
        expect(incResult.isSuccess).toBe(true);
        if (incResult.isSuccess) expect(incResult.value).toBe(11);
        expect(decResult.isSuccess).toBe(true);
        if (decResult.isSuccess) expect(decResult.value).toBe(9);
    });
});

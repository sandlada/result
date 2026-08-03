import { describe, it, expectTypeOf } from 'vitest';
import { inspect, type Inspected } from './inspect.js';
import { ok, err } from '../factories/index.js';

describe('inspect types', () => {
    it('returns Inspected<T, E> for success', () => {
        const r = inspect(ok(42));
        expectTypeOf(r).toEqualTypeOf<Inspected<number, never>>();
    });

    it('returns Inspected<T, E> for failure', () => {
        const errVal = err('boom');
        const r = inspect(errVal);
        expectTypeOf(r).toEqualTypeOf<Inspected<never, string>>();
    });

    it('Inspected is a discriminated union', () => {
        type I = Inspected<number, string>;
        const success: I = { kind: 'ok', value: 42 };
        const failure: I = { kind: 'err', error: 'fail' };
        expectTypeOf(success.kind).toEqualTypeOf<'ok'>();
        expectTypeOf(failure.kind).toEqualTypeOf<'err'>();
    });

    it('Inspected narrows value/error via kind discriminator', () => {
        const r: Inspected<number, string> = inspect(ok(42));
        if (r.kind === 'ok') {
            expectTypeOf(r.value).toBeNumber();
        } else {
            expectTypeOf(r.error).toBeString();
        }
    });

    it('Inspected readonly fields cannot be reassigned', () => {
        const r: Inspected<number, string> = inspect(ok(42));
        // @ts-expect-error - readonly field
        r.kind = 'err';
        // @ts-expect-error - readonly value
        r.value = 99;
        // @ts-expect-error - readonly error
        r.error = 'no';
    });

    it('Inspected works with complex value and error types', () => {
        type V = { count: number };
        type E = { code: number; msg: string };
        const okVal = ok<V>({ count: 1 });
        const errVal = err<E>({ code: 500, msg: 'x' });
        const rOk: Inspected<V, E> = inspect(okVal) as Inspected<V, E>;
        const rErr: Inspected<V, E> = inspect(errVal) as Inspected<V, E>;
        expectTypeOf(rOk).toEqualTypeOf<Inspected<V, E>>();
        expectTypeOf(rErr).toEqualTypeOf<Inspected<V, E>>();
    });

    it('preserves generics end-to-end', () => {
        const okR = inspect(ok(123));
        const errR = inspect(err('x'));
        expectTypeOf(okR).toEqualTypeOf<Inspected<number, never>>();
        expectTypeOf(errR).toEqualTypeOf<Inspected<never, string>>();
    });
});

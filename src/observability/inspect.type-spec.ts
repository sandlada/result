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
});

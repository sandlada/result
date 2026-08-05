import { describe, it, expectTypeOf } from 'vitest';
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

describe('catchErr types', () => {
    it('curried form returns a function with deferred A and inferred B, E', () => {
        const fn = catchErr((e: string) => e.length);
        // Shape: `<A>(r: IResultOfT<A, string>) => IResultOfT<A | number, never>`
        const _shape: <A>(r: IResultOfT<A, string>) => IResultOfT<A | number, never> = fn;
        expectTypeOf(_shape).toBeFunction();

        const r = fn(ok<Config>({ settings: { theme: 'dark' } }));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | number, never>>();
    });

    it('direct form returns IResultOfT<A | B, never> with both generics inferable', () => {
        const input = err('boom') as IResultOfT<number, string>;
        const result = catchErr((error: string) => error.length, input);
        expectTypeOf(result).toEqualTypeOf<IResultOfT<number | number, never>>();
    });

    it('handler can return a structurally different object shape (curried)', () => {
        const fn = catchErr<DefaultObj, string>((e) => ({ kind: 'Default' as const, reason: e }));
        const r = fn(err<string>('boom'));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<DefaultObj, never>>();
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<DefaultObj>();
        }
    });

    it('cross-type recovery: A = Config, B = DefaultObj, result widens', () => {
        const input = err('boom') as IResultOfT<Config, string>;
        const fn = catchErr<DefaultObj, string>((e) => ({ kind: 'Default' as const, reason: e }));
        const r = fn(input);
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | DefaultObj, never>>();
    });

    it('explicit A | B generics pin both ends of the union (direct form)', () => {
        const input = err('boom') as IResultOfT<Config, string>;
        const r = catchErr<Config, DefaultObj, string>(
            (e) => ({ kind: 'Default' as const, reason: e }),
            input,
        );
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | DefaultObj, never>>();
    });

    it('two applications of the same curried function type A independently', () => {
        const fn = catchErr<DefaultObj, string>((e) => ({ kind: 'Default' as const, reason: e }));
        const r1 = fn(err<string>('boom') as IResultOfT<string, string>);
        const r2 = fn(err<string>('boom') as IResultOfT<number, string>);
        expectTypeOf(r1).toEqualTypeOf<IResultOfT<string | DefaultObj, never>>();
        expectTypeOf(r2).toEqualTypeOf<IResultOfT<number | DefaultObj, never>>();
    });

    it('error track collapses to never on both direct and curried forms', () => {
        const fn = catchErr((error: string) => error.length);
        const r = fn(ok<Config>({ settings: { theme: 'dark' } }));
        expectTypeOf(r).toEqualTypeOf<IResultOfT<Config | number, never>>();
    });

    it('passes through unchanged on success (carries original A)', () => {
        const fn = catchErr((error: string) => error.length);
        const r = fn(ok<Config>({ settings: { theme: 'dark' } }));
        if (r.isSuccess) {
            expectTypeOf(r.value).toEqualTypeOf<Config | number>();
        }
    });
});

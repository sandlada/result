import { describe, it, expectTypeOf } from 'vitest';
import { format, type FormatOptions } from './format.js';
import { ok, err } from '../factories/index.js';

describe('format types', () => {
    it('returns string', () => {
        const r = format(ok(42));
        expectTypeOf(r).toEqualTypeOf<string>();
    });

    it('accepts any IResultOfT<T, E>', () => {
        const r = format(err('boom'));
        expectTypeOf(r).toEqualTypeOf<string>();
    });

    it('options are all optional', () => {
        const opts: FormatOptions = {
            quoteStrings: false,
            includeStack: true,
            maxDepth: 5,
        };
        expectTypeOf(opts).toEqualTypeOf<FormatOptions>();
    });

    it('format with custom error type', () => {
        type AppError = { kind: 'AppError'; message: string };
        const errVal = err<AppError>({ kind: 'AppError', message: 'x' });
        const r = format(errVal);
        expectTypeOf(r).toEqualTypeOf<string>();
    });

    it('options object accepts partial configuration', () => {
        const a = format(ok(1), { quoteStrings: false });
        const b = format(ok(1), { maxDepth: 1 });
        const c = format(ok(1), { includeStack: true });
        const d = format(ok(1), {});
        expectTypeOf(a).toEqualTypeOf<string>();
        expectTypeOf(b).toEqualTypeOf<string>();
        expectTypeOf(c).toEqualTypeOf<string>();
        expectTypeOf(d).toEqualTypeOf<string>();
    });

    it('FormatOptions properties are readonly', () => {
        const opts: FormatOptions = { maxDepth: 3 };
        // @ts-expect-error - readonly property
        opts.maxDepth = 99;
        // @ts-expect-error - readonly property
        opts.quoteStrings = false;
        // @ts-expect-error - readonly property
        opts.includeStack = true;
    });
});

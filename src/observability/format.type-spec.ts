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
});

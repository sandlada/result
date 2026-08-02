import { describe, it, expectTypeOf } from 'vitest';
import { transpose } from './transpose.js';
import { ofSome, ofNone } from './index.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';
import type { IOption } from '../types/Option.js';

describe('transpose types', () => {
    it('returns IResultOfT<IOption<T>, E>', () => {
        const r = transpose(ofSome(ok(42)));
        const _check: IResultOfT<IOption<number>, unknown> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('preserves T and E from inner Result', () => {
        const r = transpose<string, string>(ofSome(err('boom')));
        const _check: IResultOfT<IOption<string>, string> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('transposes Some(Ok(v)) to Ok(Some(v))', () => {
        const r = transpose(ofSome(ok(42)));
        if (r.isSuccess) {
            const inner = r.value;
            if (inner.isSome) {
                expectTypeOf(inner.value).toEqualTypeOf<number>();
            }
        }
    });

    it('transposes Some(Err(e)) to Err(e)', () => {
        const r = transpose(ofSome(err('boom')));
        if (!r.isSuccess) {
            expectTypeOf(r.error).toEqualTypeOf<string>();
        }
    });

    it('transposes None to Ok(None)', () => {
        const r = transpose(ofNone());
        if (r.isSuccess) {
            expectTypeOf(r.value.isNone).toBeBoolean();
        }
    });
});

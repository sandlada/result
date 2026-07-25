import { describe, it, expect } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromResult } from '../async-result/fromResult.js';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { transpose } from './transpose.js';

describe('AsyncOption transpose', () => {
    it('Some(Ok(v)) -> Ok(Some(v))', async () => {
        const r = await transpose(ofSome(fromResult(ok(42)))).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const inner = await r.value.run();
            expect(inner.isSome).toBe(true);
            if (inner.isSome) expect(inner.value).toBe(42);
        }
    });

    it('Some(Err(e)) -> Err(e)', async () => {
        const r = await transpose(ofSome(fromResult(err<string>('boom')))).run();
        expect(r.isSuccess).toBe(false);
        if (!r.isSuccess) expect(r.error).toBe('boom');
    });

    it('None -> Ok(None)', async () => {
        const r = await transpose(ofNone<ReturnType<typeof fromResult<string, string>>>()).run();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            const inner = await r.value.run();
            expect(inner.isNone).toBe(true);
        }
    });
});
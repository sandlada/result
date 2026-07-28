import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { safeTry } from './safeTry.js';

describe('safeTry()', () => {
    const successRes = ok(10);
    const failRes = err('fail');

    // @ts-ignore
    bench('safeTry (success generator)', () => {
        safeTry((function* () {
            const v1 = yield* (successRes as any);
            const v2 = yield* (ok(v1 * 2) as any);
            return ok(v2 + 5);
        }) as any);
    });

    // @ts-ignore
    bench('safeTry (fail generator)', () => {
        safeTry((function* () {
            const v1 = yield* (successRes as any);
            const v2 = yield* (failRes as any);
            return ok(v2 + 5);
        }) as any);
    });

    // @ts-ignore
    bench('baseline: manual manual check (success)', () => {
        if (!successRes.isSuccess) return successRes;
        const r2 = ok(successRes.value * 2);
        if (!r2.isSuccess) return r2;
        return ok(r2.value + 5);
    });

    // @ts-ignore
    bench('baseline: manual manual check (fail)', () => {
        if (!successRes.isSuccess) return successRes;
        if (!failRes.isSuccess) return failRes;
        return ok(failRes.value + 5);
    });
});

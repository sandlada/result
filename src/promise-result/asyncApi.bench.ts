import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { mapAsync } from './mapAsync.js';
import { bindAsync } from './bindAsync.js';

describe('PromiseResult Core APIs', () => {
    const successPromise = Promise.resolve(ok(42));
    const failPromise = Promise.resolve(err('fail'));

    const mapper = (x: number) => x * 2;
    const curriedMapAsync = mapAsync(mapper);

    const binder = (x: number) => Promise.resolve(ok(x * 2));
    const curriedBindAsync = bindAsync(binder);

    // @ts-ignore
    bench('mapAsync (success)', async () => {
        await curriedMapAsync(successPromise);
    });

    // @ts-ignore
    bench('mapAsync (fail)', async () => {
        await curriedMapAsync(failPromise);
    });

    // @ts-ignore
    bench('bindAsync (success)', async () => {
        await curriedBindAsync(successPromise);
    });

    // @ts-ignore
    bench('bindAsync (fail)', async () => {
        await curriedBindAsync(failPromise);
    });

    // @ts-ignore
    bench('baseline: native try-catch mapping (success)', async () => {
        const r = await successPromise;
        if (!r.isSuccess) return r;
        return ok(mapper(r.value));
    });

    // @ts-ignore
    bench('baseline: native try-catch mapping (fail)', async () => {
        const r = await failPromise;
        if (!r.isSuccess) return r;
        return ok(mapper(r.value));
    });

    // @ts-ignore
    bench('baseline: native async bind (success)', async () => {
        const r = await successPromise;
        if (!r.isSuccess) return r;
        return await binder(r.value);
    });

    // @ts-ignore
    bench('baseline: native async bind (fail)', async () => {
        const r = await failPromise;
        if (!r.isSuccess) return r;
        return await binder(r.value);
    });
});

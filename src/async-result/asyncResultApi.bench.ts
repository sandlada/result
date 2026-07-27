import { bench, describe } from 'vitest';
import { ok, err } from '../factories/index.js';
import { fromPromise } from './fromPromise.js';
import { map } from './map.js';
import { bind } from './bind.js';

describe('AsyncResult Core APIs', () => {
    const successCarrier = fromPromise(() => Promise.resolve(ok(42))) as any;
    const failCarrier = fromPromise(() => Promise.resolve(err('fail'))) as any;

    const mapper = (x: number) => x * 2;
    const curriedMap = map(mapper);

    const binder = (x: number) => fromPromise(() => Promise.resolve(ok(x * 2)));
    const curriedBind = bind(binder);

    // @ts-ignore
    bench('AsyncResult map (success)', async () => {
        const mapped = curriedMap(successCarrier);
        await mapped.run();
    });

    // @ts-ignore
    bench('AsyncResult map (fail)', async () => {
        const mapped = curriedMap(failCarrier);
        await mapped.run();
    });

    // @ts-ignore
    bench('AsyncResult bind (success)', async () => {
        const bound = curriedBind(successCarrier);
        await bound.run();
    });

    // @ts-ignore
    bench('AsyncResult bind (fail)', async () => {
        const bound = curriedBind(failCarrier);
        await bound.run();
    });

    // @ts-ignore
    bench('baseline: direct lazy promise execution mapping (success)', async () => {
        const getRes = async () => ok(42);
        const r = await getRes();
        if (!r.isSuccess) return r;
        return ok(mapper(r.value));
    });

    // @ts-ignore
    bench('baseline: direct lazy promise execution bind (success)', async () => {
        const getRes = async () => ok(42);
        const r = await getRes();
        if (!r.isSuccess) return r;
        const getNext = async (x: number) => ok(x * 2);
        return await getNext(r.value);
    });
});

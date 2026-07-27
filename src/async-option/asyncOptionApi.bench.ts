import { bench, describe } from 'vitest';
import { ofSome, ofNone } from '../option/index.js';
import { fromPromise } from './fromPromise.js';
import { map as mapOption } from './map.js';
import { bind as bindOption } from './bind.js';

describe('AsyncOption Core APIs', () => {
    const someCarrier = fromPromise(() => Promise.resolve(ofSome(42))) as any;
    const noneCarrier = fromPromise(() => Promise.resolve(ofNone())) as any;

    const mapper = (x: number) => x * 2;
    const curriedMap = mapOption(mapper);

    const binder = (x: number) => fromPromise(() => Promise.resolve(ofSome(x * 2)));
    const curriedBind = bindOption(binder);

    // @ts-ignore
    bench('AsyncOption mapOption (Some)', async () => {
        const mapped = curriedMap(someCarrier);
        await mapped.run();
    });

    // @ts-ignore
    bench('AsyncOption mapOption (None)', async () => {
        const mapped = curriedMap(noneCarrier);
        await mapped.run();
    });

    // @ts-ignore
    bench('AsyncOption bindOption (Some)', async () => {
        const bound = curriedBind(someCarrier);
        await bound.run();
    });

    // @ts-ignore
    bench('AsyncOption bindOption (None)', async () => {
        const bound = curriedBind(noneCarrier);
        await bound.run();
    });

    // @ts-ignore
    bench('baseline: direct lazy promise execution mapping (Some)', async () => {
        const getRes = async () => ofSome(42);
        const r = await getRes();
        if (!r.isSome) return r;
        return ofSome(mapper(r.value));
    });

    // @ts-ignore
    bench('baseline: direct lazy promise execution bind (Some)', async () => {
        const getRes = async () => ofSome(42);
        const r = await getRes();
        if (!r.isSome) return r;
        const getNext = async (x: number) => ofSome(x * 2);
        return await getNext(r.value);
    });
});

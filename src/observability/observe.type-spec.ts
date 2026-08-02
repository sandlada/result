import { describe, it, expectTypeOf } from 'vitest';
import { observe, installObserver, getActiveObserver, type Observer, type ObserveEvent } from './observe.js';
import { ok, err } from '../factories/index.js';
import type { IResultOfT } from '../types/IResultOfT.js';

describe('observe types', () => {
    it('returns IResultOfT<T, E> unchanged', () => {
        const r = observe(ok(42));
        const _check: IResultOfT<number, never> = r;
        expectTypeOf(_check).toBeObject();
    });

    it('installObserver returns a disposer function', () => {
        const cancel = installObserver(() => { /* observe */ });
        expectTypeOf(cancel).toBeFunction();
    });

    it('installObserver accepts null', () => {
        const cancel = installObserver(null);
        expectTypeOf(cancel).toBeFunction();
    });

    it('Observer accepts ObserveEvent<unknown, unknown>', () => {
        const obs: Observer = (event) => {
            expectTypeOf(event.kind).toEqualTypeOf<'ok' | 'err'>();
        };
        installObserver(obs);
        installObserver(null); // cleanup
    });

    it('getActiveObserver returns Observer | null', () => {
        const obs = getActiveObserver();
        const _check: Observer | null = obs;
        expectTypeOf(_check).toEqualTypeOf<Observer | null>();
    });

    it('ObserveEvent has kind, result, path', () => {
        type E = ObserveEvent<number, string>;
        const ev: E = {
            kind: 'ok',
            result: ok(42),
            path: [],
        };
        expectTypeOf(ev.kind).toEqualTypeOf<'ok' | 'err'>();
    });
});

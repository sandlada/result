import { bench, describe } from 'vitest';
import { ofSome } from './ofSome.js';
import { ofNone } from './ofNone.js';
import { bind as bindOption } from './bind.js';

describe('bindOption()', () => {
    const someRes = ofSome(42);
    const noneRes = ofNone();
    const binder = (x: number) => x > 10 ? ofSome(x * 2) : ofNone();
    const curriedBind = bindOption(binder);

    // @ts-ignore
    bench('bindOption (Some)', () => {
        curriedBind(someRes);
    });

    // @ts-ignore
    bench('bindOption (None)', () => {
        curriedBind(noneRes);
    });

    // @ts-ignore
    bench('baseline: manual if-else (Some)', () => {
        if (someRes.isSome) {
            return binder(someRes.value);
        }
        return someRes;
    });

    // @ts-ignore
    bench('baseline: manual if-else (None)', () => {
        if (noneRes.isSome) {
            return binder(noneRes.value);
        }
        return noneRes;
    });
});

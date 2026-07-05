import type { IResultOfT } from '../types/IResultOfT.js';
import { ok } from '../factories/ok.js';
import { err } from '../factories/err.js';

/**
 * Maps both success and failure values of a `Promise<IResultOfT<A, E>>` simultaneously.
 */
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
): (r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, F>>;
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
    r: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, F>>;
export function bimapAsync<A, E, B, F>(
    onOk: (a: A) => B | Promise<B>,
    onErr: (e: E) => F | Promise<F>,
    r?: Promise<IResultOfT<A, E>>,
): Promise<IResultOfT<B, F>> | ((r: Promise<IResultOfT<A, E>>) => Promise<IResultOfT<B, F>>) {
    if (r === undefined) return (r: Promise<IResultOfT<A, E>>) => bimapAsync(onOk, onErr, r);
    return r.then(async inner => {
        try {
            if (inner.isSuccess) {
                return ok(await onOk(inner.value)) as unknown as IResultOfT<B, F>;
            } else {
                return err(await onErr(inner.error)) as unknown as IResultOfT<B, F>;
            }
        } catch (e: unknown) {
            return err(e as F) as IResultOfT<B, F>;
        }
    });
}

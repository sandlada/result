import { describe, it, expectTypeOf } from 'vitest';
import { mapOrAsync } from './mapOrAsync.js';
import { ofSome, ofNone } from '../option/index.js';
import type { IOption } from '../types/Option.js';

describe('mapOrAsync types', () => {
    it('curried form returns (r: Promise<IOption<A>>) => Promise<B>', () => {
        const fn = mapOrAsync(-1, (x: number) => x * 2);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('direct form returns Promise<B>', () => {
        const p = mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('mapper may return Promise<B>', () => {
        const fn = mapOrAsync(-1, async (x: number) => x * 2);
        const _check: (r: Promise<IOption<number>>) => Promise<number> = fn;
        expectTypeOf(_check).toBeFunction();
    });

    it('default value type drives B when mapper type differs', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = mapOrAsync('default', (n: number) => n.toString(), Promise.resolve(noneOpt));
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('handles ofNone input — returns default', () => {
        const noneOpt: IOption<number> = ofNone();
        const p = mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(noneOpt));
        const _check: Promise<number> = p;
        expectTypeOf(_check).toBeObject();
    });

    it('infers a structural return-type for the curried application', () => {
        const fn = mapOrAsync(-1, (x: number) => x * 2);
        expectTypeOf(fn).toEqualTypeOf<(r: Promise<IOption<number>>) => Promise<number>>();
    });

    it('infers a structural return-type for the direct application', () => {
        const p = mapOrAsync(-1, (x: number) => x * 2, Promise.resolve(ofSome(21)));
        expectTypeOf(p).toEqualTypeOf<Promise<number>>();
    });

    it('infers B from the default value when mapper returns a different B (annotation widening)', () => {
        // The default value drives B when it carries a wider type than the
        // mapper's natural return type. We assert only the type-level
        // relationship `Promise<string>` (not the structural equality),
        // because literal widening depends on the call-site context.
        const noneOpt: IOption<number> = ofNone();
        const p = mapOrAsync('default', (n: number) => n.toString(), Promise.resolve(noneOpt));
        const _check: Promise<string> = p;
        expectTypeOf(_check).toBeObject();
    });
});

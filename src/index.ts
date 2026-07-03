// ── Type exports ────────────────────────────────────────────────────────────
export type {
    IResult,
    IResultSuccess,
    IResultFailure,
} from './types/IResult.js';
export type {
    IResultOfT,
    IResultOfTSuccess,
    IResultOfTFailure,
} from './types/IResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './types/Option.js';

// ── Core constructors ───────────────────────────────────────────────────────
export { ok } from './factories/ok.js';
export { err } from './factories/err.js';
export { fromPredicate } from './factories/fromPredicate.js';
export { fromThrowable } from './factories/fromThrowable.js';
export { tryCatch } from './factories/tryCatch.js';
export { tryCatchAsync } from './factories/tryCatchAsync.js';
export { fromPromise } from './factories/fromPromise.js';
export { asyncOk } from './factories/asyncOk.js';
export { asyncErr } from './factories/asyncErr.js';

// ── Sync operators ──────────────────────────────────────────────────────────
export { map } from './operators/map.js';
export { mapErr } from './operators/mapErr.js';
export { bind } from './operators/bind.js';
export { orElse } from './operators/orElse.js';
export { match } from './operators/match.js';
export { tap } from './operators/tap.js';
export { tapErr } from './operators/tapErr.js';
export { unwrapOr } from './operators/unwrapOr.js';
export { unwrapOrElse } from './operators/unwrapOrElse.js';
export { unwrap } from './operators/unwrap.js';
export { expect } from './operators/expect.js';
export { unwrapErr } from './operators/unwrapErr.js';
export { expectErr } from './operators/expectErr.js';
export { flatten } from './operators/flatten.js';
export { and } from './operators/and.js';
export { or } from './operators/or.js';
export { contains } from './operators/contains.js';
export { exists } from './operators/exists.js';
export { bimap } from './operators/bimap.js';
export { swap } from './operators/swap.js';
export { mapOr } from './operators/mapOr.js';
export { mapOrElse } from './operators/mapOrElse.js';

// ── Async operators ─────────────────────────────────────────────────────────
export { mapAsync } from './async/mapAsync.js';
export { mapErrAsync } from './async/mapErrAsync.js';
export { bindAsync } from './async/bindAsync.js';
export { orElseAsync } from './async/orElseAsync.js';
export { matchAsync } from './async/matchAsync.js';
export { tapAsync } from './async/tapAsync.js';
export { tapErrAsync } from './async/tapErrAsync.js';
export { unwrapOrAsync } from './async/unwrapOrAsync.js';

// ── Composition ─────────────────────────────────────────────────────────────
export { composeK } from './composition/composeK.js';
export { pipe } from './composition/pipe.js';
export { composeKAsync } from './composition/composeKAsync.js';
export { pipeAsync } from './composition/pipeAsync.js';

// ── Adapters ────────────────────────────────────────────────────────────────
export { switchFn } from './adapters/switchFn.js';
export { liftMap } from './adapters/liftMap.js';
export { tee } from './adapters/tee.js';
export { toOption } from './adapters/toOption.js';
export { fromOption } from './adapters/fromOption.js';
export { switchFnAsync } from './adapters/switchFnAsync.js';
export { teeAsync } from './adapters/teeAsync.js';

// ── Combine ─────────────────────────────────────────────────────────────────
export { combine } from './combine/combine.js';
export { all } from './combine/all.js';
export { combineWithAllErrors } from './combine/combineWithAllErrors.js';

// ── Option (re-exported with renamed identifiers) ───────────────────────────
export { ofSome, ofNone } from './option/index.js';
export {
    map as mapOption,
    andThen,
    orElse as orElseOption,
    match as matchOption,
    tap as tapOption,
    unwrapOr as unwrapOrOption,
    filter as filterOption,
    flatten as flattenOption,
    contains as containsOption,
} from './option/index.js';


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
export type { AsyncResult } from './types/AsyncResult.js';

// ── Core constructors ───────────────────────────────────────────────────────
export { ok } from './factories/ok.js';
export { err } from './factories/err.js';
export { fromPredicate } from './factories/fromPredicate.js';
export { fromThrowable } from './factories/fromThrowable.js';
export { tryCatch } from './factories/tryCatch.js';
export { tryCatchAsync } from './factories/tryCatchAsync.js';
export { fromPromise } from './factories/fromPromise.js';
export { fromSafePromise } from './factories/fromSafePromise.js';
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
export { ap } from './operators/ap.js';
export { separate } from './operators/separate.js';
export { traverseArray } from './operators/traverseArray.js';
export { andTee } from './operators/andTee.js';
export { orTee } from './operators/orTee.js';
export { andThrough } from './operators/andThrough.js';
export { filterOrElse } from './operators/filterOrElse.js';
export { orThrow, orThrowWith } from './operators/orThrow.js';
export { unsafeUnwrap } from './operators/unsafeUnwrap.js';
export { unsafeUnwrapErr } from './operators/unsafeUnwrapErr.js';

// ── Async operators ─────────────────────────────────────────────────────────
export { mapAsync } from './async/mapAsync.js';
export { mapErrAsync } from './async/mapErrAsync.js';
export { mapOrAsync } from './async/mapOrAsync.js';
export { mapOrElseAsync } from './async/mapOrElseAsync.js';
export { bindAsync } from './async/bindAsync.js';
export { orElseAsync } from './async/orElseAsync.js';
export { matchAsync } from './async/matchAsync.js';
export { tapAsync } from './async/tapAsync.js';
export { tapErrAsync } from './async/tapErrAsync.js';
export { unwrapOrAsync } from './async/unwrapOrAsync.js';
export { unwrapOrElseAsync } from './async/unwrapOrElseAsync.js';
export { asyncMap } from './async/asyncMap.js';
export { asyncAndThen } from './async/asyncAndThen.js';
export { asyncAndThrough } from './async/asyncAndThrough.js';

// ── Composition ─────────────────────────────────────────────────────────────
export { composeK } from './composition/composeK.js';
export { pipe } from './composition/pipe.js';
export { composeKAsync } from './composition/composeKAsync.js';
export { safeTry } from './composition/safeTry.js';
export { fromSafeTry } from './composition/safeTry.js';
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

// ── AsyncResult ─────────────────────────────────────────────────────────────
export {
    from,
    fromPromise as asyncResultFromPromise,
    fromResult,
    map as asyncResultMap,
    mapAsync as asyncResultMapAsync,
    mapErr as asyncResultMapErr,
    andThen as asyncResultAndThen,
    orElse as asyncResultOrElse,
    match as asyncResultMatch,
    tap as asyncResultTap,
    tapErr as asyncResultTapErr,
    unwrapOr as asyncResultUnwrapOr,
    combine as asyncResultCombine,
    combineWithAllErrors as asyncResultCombineWithAllErrors,
} from './async-result/index.js';

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
    all as allOption,
    zipWith as zipWithOption,
    okOr as okOrOption,
    okOrElse as okOrElseOption,
    transpose as transposeOption,
} from './option/index.js';


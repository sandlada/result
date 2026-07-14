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
export type { AsyncOption } from './types/AsyncOption.js';

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
export {
    asyncBind,
    asyncBindThrough,
    asyncMap,
    asyncTap,
    asyncTapErr,
    bimapAsync,
    bindAsync,
    bindThroughAsync,
    containsAsync,
    existsAsync,
    filterOrElseAsync,
    flattenAsync,
    mapAsync,
    mapErrAsync,
    mapOrAsync,
    mapOrElseAsync,
    matchAsync,
    orElseAsync,
    swapAsync,
    tapAsync,
    tapErrAsync,
    unwrapOrAsync,
    unwrapOrElseAsync,
    asyncBindOption,
    asyncTapOption,
    bindAsyncOption,
    containsAsyncOption,
    existsAsyncOption,
    filterAsyncOption,
    flattenAsyncOption,
    mapAsyncOption,
    matchAsyncOption,
    orElseAsyncOption,
    tapAsyncOption,
    unwrapOrAsyncOption,
} from './async/index.js';

// ── Composition ─────────────────────────────────────────────────────────────
export { composeK } from './composition/composeK.js';
export { composeKAsync } from './composition/composeKAsync.js';
export { pipe } from './composition/pipe.js';
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
    andTee as asyncResultAndTee,
    andThrough as asyncResultAndThrough,
    bimap as asyncResultBimap,
    bind as asyncResultBind,
    combine as asyncResultCombine,
    combineWithAllErrors as asyncResultCombineWithAllErrors,
    contains as asyncResultContains,
    exists as asyncResultExists,
    filterOrElse as asyncResultFilterOrElse,
    flatten as asyncResultFlatten,
    map as asyncResultMap,
    mapAsync as asyncResultMapAsync,
    mapErr as asyncResultMapErr,
    mapErrAsync as asyncResultMapErrAsync,
    match as asyncResultMatch,
    orElse as asyncResultOrElse,
    orTee as asyncResultOrTee,
    swap as asyncResultSwap,
    tap as asyncResultTap,
    tapAsync as asyncResultTapAsync,
    tapErr as asyncResultTapErr,
    tapErrAsync as asyncResultTapErrAsync,
    unwrapOr as asyncResultUnwrapOr,
} from './async-result/index.js';

// ── AsyncOption ─────────────────────────────────────────────────────────────
export {
    from as asyncOptionFrom,
    fromPromise as asyncOptionFromPromise,
    fromOption as asyncOptionFromOption,
    bind as asyncOptionBind,
    contains as asyncOptionContains,
    exists as asyncOptionExists,
    filter as asyncOptionFilter,
    flatten as asyncOptionFlatten,
    map as asyncOptionMap,
    mapAsync as asyncOptionMapAsync,
    match as asyncOptionMatch,
    orElse as asyncOptionOrElse,
    tap as asyncOptionTap,
    tapAsync as asyncOptionTapAsync,
    unwrapOr as asyncOptionUnwrapOr,
} from './async-option/index.js';

// ── Option (re-exported with renamed identifiers) ───────────────────────────
export { ofSome, ofNone } from './option/index.js';
export {
    all as allOption,
    bind as bindOption,
    contains as containsOption,
    filter as filterOption,
    flatten as flattenOption,
    map as mapOption,
    match as matchOption,
    okOr as okOrOption,
    okOrElse as okOrElseOption,
    orElse as orElseOption,
    tap as tapOption,
    transpose as transposeOption,
    unwrapOr as unwrapOrOption,
    zipWith as zipWithOption,
} from './option/index.js';

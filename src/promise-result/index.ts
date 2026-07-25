/**
 * Async operators — barrel export.
 *
 * Re-exports all asynchronous operators for working with Promise<Result> values.
 */

// ── Result-flavored ─────────────────────────────────────────────────────────

// Sync operators (operate on `Promise<IResultOfT>`, sync fn)
export { flatten } from './flatten.js';
export { map } from './map.js';
export { mapErr } from './mapErr.js';
export { unwrapOr } from './unwrapOr.js';
export { unwrapOrElse } from './unwrapOrElse.js';

// Async operators (operate on `Promise<IResultOfT>`, sync-or-async fn)
export { bimapAsync } from './bimapAsync.js';
export { bindAsync } from './bindAsync.js';
export { bindThroughAsync } from './bindThroughAsync.js';
export { containsAsync } from './containsAsync.js';
export { existsAsync } from './existsAsync.js';
export { filterOrElseAsync } from './filterOrElseAsync.js';
export { flattenAsync } from './flattenAsync.js';
export { mapAsync } from './mapAsync.js';
export { mapErrAsync } from './mapErrAsync.js';
export { mapOrAsync } from './mapOrAsync.js';
export { mapOrElseAsync } from './mapOrElseAsync.js';
export { matchAsync } from './matchAsync.js';
export { orElseAsync } from './orElseAsync.js';
export { swapAsync } from './swapAsync.js';
export { tapAsync } from './tapAsync.js';
export { tapErrAsync } from './tapErrAsync.js';
export { unwrapOrAsync } from './unwrapOrAsync.js';
export { unwrapOrElseAsync } from './unwrapOrElseAsync.js';

// Lift operators (operate on sync `IResultOfT`, async fn)
export { asyncBind } from './asyncBind.js';
export { asyncBindThrough } from './asyncBindThrough.js';
export { asyncMap } from './asyncMap.js';
export { asyncMatch } from './asyncMatch.js';
export { asyncOrElse } from './asyncOrElse.js';
export { asyncTap } from './asyncTap.js';
export { asyncTapErr } from './asyncTapErr.js';

// Combinators
export { ap } from './ap.js';
export { combine } from './combine.js';
export { combineWithAllErrors } from './combineWithAllErrors.js';

// ── Option-flavored ─────────────────────────────────────────────────────────

// Sync operators on `Promise<IOption>`
export { flattenAsyncOption } from './flattenAsyncOption.js';
export { mapAsyncOption } from './mapAsyncOption.js';
export { matchAsyncOption } from './matchAsyncOption.js';
export { orElseAsyncOption } from './orElseAsyncOption.js';
export { tapAsyncOption } from './tapAsyncOption.js';
export { unwrapOrAsyncOption } from './unwrapOrAsyncOption.js';

// Async operators on `Promise<IOption>`
export { bindAsyncOption } from './bindAsyncOption.js';
export { containsAsyncOption } from './containsAsyncOption.js';
export { existsAsyncOption } from './existsAsyncOption.js';
export { filterAsyncOption } from './filterAsyncOption.js';
export { mapOrAsyncOption } from './mapOrAsyncOption.js';
export { mapOrElseAsyncOption } from './mapOrElseAsyncOption.js';
export { tapErrAsyncOption } from './tapErrAsyncOption.js';
export { unwrapOrElseAsyncOption } from './unwrapOrElseAsyncOption.js';

// Lift operators on sync `IOption`
export { asyncBindOption } from './asyncBindOption.js';
export { asyncMapOption } from './asyncMapOption.js';
export { asyncMatchOption } from './asyncMatchOption.js';
export { asyncOrElseOption } from './asyncOrElseOption.js';
export { asyncTapOption } from './asyncTapOption.js';
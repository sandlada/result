/**
 * Async operators — barrel export.
 *
 * Re-exports all asynchronous operators for working with `Promise<IResultOfT<T, E>>` values.
 *
 * For `Promise<IOption<T>>` operators, see `../promise-option/index.js` (subpath `./promise-option`).
 */

// ── Sync operators (operate on `Promise<IResultOfT>`, sync fn) ───────────────
export { flatten } from './flatten.js';
export { map } from './map.js';
export { mapErr } from './mapErr.js';
export { unwrapOr } from './unwrapOr.js';
export { unwrapOrElse } from './unwrapOrElse.js';

// ── Async operators (operate on `Promise<IResultOfT>`, sync-or-async fn) ────
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

// ── Lift operators (operate on sync `IResultOfT`, async fn) ──────────────────
export { asyncBind } from './asyncBind.js';
export { asyncBindThrough } from './asyncBindThrough.js';
export { asyncMap } from './asyncMap.js';
export { asyncOrElse } from './asyncOrElse.js';
export { asyncTap } from './asyncTap.js';
export { asyncTapErr } from './asyncTapErr.js';

// ── Combinators ──────────────────────────────────────────────────────────────
export { ap } from './ap.js';
export { combine } from './combine.js';
export { combineWithAllErrors } from './combineWithAllErrors.js';
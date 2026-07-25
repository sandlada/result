/**
 * Async operators on `Promise<IOption<T>>` — barrel export.
 *
 * Mirrors the structure of `promise-result/` but for the Option type.
 * Callbacks may be sync or async; predicates use catch+convert policy.
 *
 * @see ./README.md for full operator catalogue.
 */

// ── Convenience factories (pre-resolved Promise<IResultOfT>) ─────────────────
export { asyncOk } from '../factories/asyncOk.js';
export { asyncErr } from '../factories/asyncErr.js';

// ── Sync `IOption` constructors ─────────────────────────────────────────────
export { ofSome } from '../option/ofSome.js';
export { ofNone } from '../option/ofNone.js';

// ── Result-flavored: operate on `Promise<IOption<T>>` with sync-or-async fn ─
export { bindAsyncOption } from './bindAsyncOption.js';
export { containsAsyncOption } from './containsAsyncOption.js';
export { existsAsyncOption } from './existsAsyncOption.js';
export { filterAsyncOption } from './filterAsyncOption.js';
export { flattenAsyncOption } from './flattenAsyncOption.js';
export { mapAsyncOption } from './mapAsyncOption.js';
export { mapOrAsyncOption } from './mapOrAsyncOption.js';
export { mapOrElseAsyncOption } from './mapOrElseAsyncOption.js';
export { matchAsyncOption } from './matchAsyncOption.js';
export { orElseAsyncOption } from './orElseAsyncOption.js';
export { tapAsyncOption } from './tapAsyncOption.js';
export { tapErrAsyncOption } from './tapErrAsyncOption.js';
export { unwrapOrAsyncOption } from './unwrapOrAsyncOption.js';
export { unwrapOrElseAsyncOption } from './unwrapOrElseAsyncOption.js';

// ── Lift: operate on sync `IOption<T>` with async fn ───────────────────────
export { asyncBindOption } from './asyncBindOption.js';
export { asyncMapOption } from './asyncMapOption.js';
export { asyncMatchOption } from './asyncMatchOption.js';
export { asyncOrElseOption } from './asyncOrElseOption.js';
export { asyncTapOption } from './asyncTapOption.js';
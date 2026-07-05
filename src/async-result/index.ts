/**
 * AsyncResult — barrel export.
 *
 * Re-exports all AsyncResult factories and operators.
 */

// ── Factories ───────────────────────────────────────────────────────────────
export { from } from './from.js';
export { fromPromise } from './fromPromise.js';
export { fromResult } from './fromResult.js';

// ── Operators ───────────────────────────────────────────────────────────────
export { map } from './map.js';
export { mapAsync } from './mapAsync.js';
export { mapErr } from './mapErr.js';
export { mapErrAsync } from './mapErrAsync.js';
export { andThen } from './andThen.js';
export { orElse } from './orElse.js';
export { match } from './match.js';
export { tap } from './tap.js';
export { tapAsync } from './tapAsync.js';
export { tapErr } from './tapErr.js';
export { tapErrAsync } from './tapErrAsync.js';
export { unwrapOr } from './unwrapOr.js';
export { combine } from './combine.js';
export { combineWithAllErrors } from './combineWithAllErrors.js';

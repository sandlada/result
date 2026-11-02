/**
 * Async operators on `Promise<IOption<T>>` — barrel export.
 *
 * Mirrors the structure of `promise-result/` but for the Option type.
 * For lifting sync `IOption` into `Promise<IOption>`, see `../bridge-option/index.js`.
 *
 * @packageDocumentation
 */

export { bindAsync } from './bindAsync.js';
export { containsAsync } from './containsAsync.js';
export { existsAsync } from './existsAsync.js';
export { filterAsync } from './filterAsync.js';
export { flattenAsync } from './flattenAsync.js';
export { mapAsync } from './mapAsync.js';
export { mapOrAsync } from './mapOrAsync.js';
export { mapOrElseAsync } from './mapOrElseAsync.js';
export { matchAsync } from './matchAsync.js';
export { orElseAsync } from './orElseAsync.js';
export { tapAsync } from './tapAsync.js';
export { tapErrAsync } from './tapErrAsync.js';
export { unwrapOrAsync } from './unwrapOrAsync.js';
export { unwrapOrElseAsync } from './unwrapOrElseAsync.js';

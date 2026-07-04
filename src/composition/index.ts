/**
 * Composition utilities — barrel export.
 *
 * Re-exports Kleisli composition and pipe utilities for Result pipelines.
 */

export { composeK } from './composeK.js';
export { composeKAsync } from './composeKAsync.js';
export { fromSafeTry } from './safeTry.js';
export { pipe } from './pipe.js';
export { pipeAsync } from './pipeAsync.js';
export { safeTry } from './safeTry.js';

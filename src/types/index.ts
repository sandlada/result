/**
 * Result type definitions — barrel export.
 *
 * Re-exports all discriminated union type interfaces.
 */

export type { IResult, IResultSuccess, IResultFailure } from './IResult.js';
export type {
    IResultOfT,
    IResultOfTSuccess,
    IResultOfTFailure,
} from './IResultOfT.js';
export type { IOption, IOptionSome, IOptionNone } from './Option.js';
export type { AsyncResult } from './AsyncResult.js';

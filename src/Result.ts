import type { IResult } from './IResult.js';
import type { IResultOfT } from './IResultOfT.js';

/**
 * Internal sentinel used for the `error` property of a success result.
 *
 * Uses `Symbol.for()` so it survives module reloads in dev.
 * Cast to `TError` so it satisfies the type system while being
 * distinguishable from a real user-supplied error.
 */
const NONE: unique symbol = Symbol.for('result:none');

/**
 * Base class implementing the core result invariant.
 *
 * ## Invariant (enforced by constructor)
 * - `isSuccess && error !== NONE` → **throw** (success must not carry a real error)
 * - `!isSuccess && error === NONE` → **throw** (failure must carry a real error)
 *
 * Users do not instantiate this class directly.
 * Use the static factory methods: {@link Result.Success}, {@link Result.Failure}.
 */
export class Result<TError = Error> implements IResult<TError> {
    readonly isSuccess: boolean;
    readonly error: TError;

    /**
     * **Internal.** Validates the mutual-exclusivity invariant.
     *
     * @throws If the invariant is violated (success with real error, or failure with NONE).
     */
    protected constructor(isSuccess: boolean, error?: TError) {
        this.isSuccess = isSuccess;
        if (isSuccess && error !== (NONE as unknown as TError)) {
            throw new TypeError(
                'Result invariant violated: success must not carry a real error.',
            );
        }
        if (!isSuccess && error === (NONE as unknown as TError)) {
            throw new TypeError(
                'Result invariant violated: failure must carry a real error.',
            );
        }
        this.error = error as TError;
    }

    get isFailure(): boolean {
        return !this.isSuccess;
    }

    /** Creates a void success result (no value). */
    static Success(): IResult;
    /** Creates a success result carrying a value. Type is inferred. */
    static Success<TValue>(value: TValue): IResultOfT<TValue>;
    static Success<TValue>(value?: TValue): IResult | IResultOfT<TValue> {
        if (arguments.length === 0) {
            return new Result<Error>(true, (NONE as unknown) as Error);
        }
        return new ResultOfT<TValue, Error>(value!, true);
    }

    /** Creates a void failure result. */
    static Failure(error: Error): IResult;
    /** Creates a typed failure result. `TValue` must be specified. */
    static Failure<TValue, TError>(error: TError): IResultOfT<TValue, TError>;
    static Failure<TValue, TError>(error?: TError): IResult | IResultOfT<TValue, TError> {
        if (error === undefined) {
            throw new TypeError('Result.Failure requires an error argument.');
        }
        return new ResultOfT<TValue, TError>(undefined, false, error);
    }
}

/**
 * Generic result carrying a success value.
 *
 * Extends the {@link Result} base class and implements
 * {@link IResultOfT}.
 *
 * Users do not instantiate this class directly.
 * Use {@link Result.Success} or {@link Result.Failure}.
 */
export class ResultOfT<TValue, TError = Error> extends Result<TError> implements IResultOfT<TValue, TError> {
    readonly #value: TValue | undefined;

    /**
     * **Internal.** Constructed by {@link Result} factory methods.
     */
    constructor(value?: TValue, isSuccess?: boolean, error?: TError) {
        const sentinelError = (NONE as unknown) as TError;
        super(
            isSuccess ?? true,
            isSuccess === false ? error! : sentinelError,
        );
        this.#value = value;
    }

    /**
     * The success payload.
     * @throws {TypeError} If this result represents a failure.
     */
    get value(): TValue {
        if (!this.isSuccess) {
            throw new TypeError(
                'Cannot access value on a failure result. Check isSuccess before accessing value.',
            );
        }
        return this.#value as TValue;
    }
}

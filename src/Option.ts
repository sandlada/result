/**
 * IOptionBase — internal flat interface for class implementation.
 *
 * A class cannot `implements` a union type, so this flat base provides
 * the full shape (including all instance method signatures) that the
 * {@link Option} class implements internally.
 *
 * @internal
 */
export interface IOptionBase<T> {
    /** `true` if this is a Some variant (carries a value). */
    readonly isSome: boolean;

    /** `true` if this is a None variant (no value). */
    readonly isNone: boolean;

    /** The contained value. Throws `TypeError` if accessed on None. */
    readonly value: T;

    /** Transforms the value if Some. On None, passes through unchanged. */
    map<U>(fn: (value: T) => U): IOption<U>;

    /** Chains an Option-returning function (monadic bind). */
    andThen<U>(fn: (value: T) => IOption<U>): IOption<U>;

    /** Falls back to an alternative Option if None. On Some, passes through. */
    orElse(fn: () => IOption<T>): IOption<T>;

    /** Terminal — pattern-matches on both cases. */
    match<U>(onSome: (value: T) => U, onNone: () => U): U;

    /** Side-effect on the Some track. Returns `this` for chaining. */
    tap(fn: (value: T) => void): IOption<T>;

    /** Extracts the value on Some, or returns a default on None. */
    unwrapOr(defaultValue: T): T;

    /**
     * Flattens a nested Option.
     *
     * F# equivalent: `Option.flatten`.
     */
    flatten(): T extends IOption<infer U> ? IOption<U> : never;

    /** Serializes to a plain object for JSON.stringify. */
    toJSON(): { isSome: true; value: T } | { isSome: false };
}

/**
 * IOptionSome — the Some variant of {@link IOption}.
 *
 * Uses the **Omit pattern** (inspired by true-myth): extends
 * `Omit<IOptionBase, 'isSome' | 'isNone'>` so all instance methods are
 * inherited, then re-declares `isSome`/`isNone` as literal types and
 * keeps `value`.
 */
export interface IOptionSome<T>
    extends Omit<IOptionBase<T>, 'isSome' | 'isNone'> {
    /** `true` — discriminates this Some variant. */
    readonly isSome: true;

    /** `false` — always the negation of `isSome`. */
    readonly isNone: false;

    /** The contained value. */
    readonly value: T;
}

/**
 * IOptionNone — the None variant of {@link IOption}.
 *
 * Uses the **Omit pattern**: extends
 * `Omit<IOptionBase, 'value' | 'isSome' | 'isNone'>` so all instance
 * methods are inherited, then re-declares `isSome`/`isNone` as literal
 * types. The `value` property is **omitted**.
 */
export interface IOptionNone
    extends Omit<IOptionBase<never>, 'value' | 'isSome' | 'isNone'> {
    /** `false` — discriminates this None variant. */
    readonly isSome: false;

    /** `true` — always the negation of `isSome`. */
    readonly isNone: true;
}

/**
 * IOption<T> — represents an optional value, expressed as a
 * **discriminated union**.
 *
 * A value is **either** a Some (carrying `value`) **or** a None (no value).
 *
 * Check `isSome` to narrow before accessing `value`:
 *
 * ```ts
 * if (option.isSome) {
 *     console.log(option.value); // safe — narrowed to Some
 * } else {
 *     // option.value — type error: not on None variant
 * }
 * ```
 *
 * @typeParam T - The contained value type.
 */
export type IOption<T> = IOptionSome<T> | IOptionNone;

/**
 * Concrete Option class.
 *
 * Users do not instantiate this directly.
 * Use {@link Option.Some} or {@link Option.None}.
 *
 * Static factories live on {@link Option}, matching the {@link Result} convention:
 *
 * ```ts
 * const some = Option.Some(42);
 * const none = Option.None();
 * ```
 *
 * Type annotations use {@link IOption}:
 *
 * ```ts
 * function find(id: string): IOption<User> { ... }
 * ```
 */
export class Option<T> implements IOptionBase<T> {
    readonly #isSome: boolean;
    readonly #value: T | undefined;

    private constructor(isSome: boolean, value?: T) {
        this.#isSome = isSome;
        this.#value = value;
    }

    get isSome(): boolean {
        return this.#isSome;
    }

    get isNone(): boolean {
        return !this.#isSome;
    }

    /**
     * The contained value.
     * @throws {TypeError} If this Option is None.
     */
    get value(): T {
        if (!this.#isSome) {
            throw new TypeError(
                'Cannot access value on None. Check isSome before accessing value.',
            );
        }
        return this.#value as T;
    }

    // ── Static factories (PascalCase) ──────────────────────────────────

    /** Creates a Some (contains a value). */
    static Some<T>(value: T): IOption<T> {
        return new Option<T>(true, value) as unknown as IOption<T>;
    }

    /** Creates a None (no value). */
    static None(): IOption<never> {
        return new Option<never>(false) as unknown as IOption<never>;
    }

    // ── Instance methods ───────────────────────────────────────────────

    /** Transforms the value if Some. On None, passes through unchanged. */
    map<U>(fn: (value: T) => U): IOption<U> {
        if (!this.#isSome) return this as unknown as IOption<U>;
        return Option.Some(fn(this.#value as T));
    }

    /** Chains an Option-returning function (monadic bind). */
    andThen<U>(fn: (value: T) => IOption<U>): IOption<U> {
        if (!this.#isSome) return this as unknown as IOption<U>;
        return fn(this.#value as T);
    }

    /** Falls back to an alternative Option if None. On Some, passes through. */
    orElse(fn: () => IOption<T>): IOption<T> {
        if (this.#isSome) return this as unknown as IOption<T>;
        return fn();
    }

    /** Terminal — pattern-matches on both cases. */
    match<U>(onSome: (value: T) => U, onNone: () => U): U {
        return this.#isSome ? onSome(this.#value as T) : onNone();
    }

    /** Side-effect on the Some track. Returns `this` for chaining. */
    tap(fn: (value: T) => void): IOption<T> {
        if (this.#isSome) fn(this.#value as T);
        return this as unknown as IOption<T>;
    }

    /** Extracts the value on Some, or returns a default on None. */
    unwrapOr(defaultValue: T): T {
        return this.#isSome ? (this.#value as T) : defaultValue;
    }

    /**
     * Flattens a nested Option.
     *
     * F# equivalent: `Option.flatten`.
     */
    flatten(): T extends IOption<infer U> ? IOption<U> : never {
        if (!this.#isSome) return this as any;
        return this.#value as any;
    }

    /** Serializes to a plain object for JSON.stringify. */
    toJSON(): { isSome: true; value: T } | { isSome: false } {
        return this.#isSome
            ? { isSome: true as const, value: this.#value! }
            : { isSome: false as const };
    }
}


/**
 * @fileoverview Option — the optional value discriminated union.
 *
 * An optional value is **either** a Some ({@link IOptionSome}, carrying
 * `value`) **or** a None ({@link IOptionNone}, no value).
 *
 * Check `isSome` to narrow before accessing `value`:
 *
 * ```ts
 * if (option.isSome) {
 *   console.log(option.value); // safe — narrowed to Some
 * } else {
 *   // option.value — type error: not on None variant
 * }
 * ```
 *
 * @typeParam T — The contained value type.
 *
 * @note Ready for Product
 */

/**
 * IOptionSome — the Some variant of {@link IOption}.
 */
export interface IOptionSome<T> {
    readonly isSome: true;
    readonly isNone: false;
    readonly value: T;
}

/**
 * IOptionNone — the None variant of {@link IOption}.
 */
export interface IOptionNone {
    readonly isSome: false;
    readonly isNone: true;
}

/**
 * IOption — optional value contract as a **discriminated union**.
 *
 * @typeParam T — The contained value type.
 *
 * @note Ready for Product
 */
export type IOption<T> = IOptionSome<T> | IOptionNone;


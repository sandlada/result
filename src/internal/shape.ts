import type { IResultSuccess } from '../types/IResult.js';
import type { IResultOfTSuccess, IResultOfTFailure } from '../types/IResultOfT.js';
import type { IOptionSome, IOptionNone } from '../types/Option.js';

export const successShape = (): IResultSuccess => ({
    isSuccess: true as const,
    isFailure: false as const,
});

export const okShape = <T>(value: T): IResultOfTSuccess<T> => ({
    isSuccess: true as const,
    isFailure: false as const,
    value,
});

export const errShape = <E>(error: E): IResultOfTFailure<E> => ({
    isSuccess: false as const,
    isFailure: true as const,
    error,
});

export const someShape = <T>(value: T): IOptionSome<T> => ({
    isSome: true as const,
    isNone: false as const,
    value,
});

const NONE: IOptionNone = Object.freeze({
    isSome: false as const,
    isNone: true as const,
}) as IOptionNone;

export const noneShape: IOptionNone = NONE;

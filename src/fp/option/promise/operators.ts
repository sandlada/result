import type { IOption } from '../../../Option.js';
import { AsyncOption } from '../../../promise/AsyncOption.js';

export function map<T, U>(fn: (value: T) => U): (opt: AsyncOption<T>) => AsyncOption<U> {
    return opt => opt.map(fn);
}

export function mapAsync<T, U>(fn: (value: T) => Promise<U>): (opt: AsyncOption<T>) => AsyncOption<U> {
    return opt => opt.mapAsync(fn);
}

export function andThen<T, U>(
    fn: (value: T) => AsyncOption<U> | IOption<U> | Promise<IOption<U>>,
): (opt: AsyncOption<T>) => AsyncOption<U> {
    return opt => opt.andThen(fn);
}

export function orElse<T>(
    fn: () => AsyncOption<T> | IOption<T> | Promise<IOption<T>>,
): (opt: AsyncOption<T>) => AsyncOption<T> {
    return opt => opt.orElse(fn);
}

export function match<T, U>(
    onSome: (value: T) => U,
    onNone: () => U,
): (opt: AsyncOption<T>) => Promise<U> {
    return opt => opt.match(onSome, onNone);
}

export function tap<T>(fn: (value: T) => void): (opt: AsyncOption<T>) => AsyncOption<T> {
    return opt => opt.tap(fn);
}

export function unwrapOr<T>(defaultValue: T): (opt: AsyncOption<T>) => Promise<T> {
    return opt => opt.unwrapOr(defaultValue);
}

export function flatten<T>(opt: AsyncOption<AsyncOption<T> | IOption<T>>): AsyncOption<T> {
    return opt.flatten();
}

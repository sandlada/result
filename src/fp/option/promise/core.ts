import { AsyncOption } from '../../../promise/AsyncOption.js';

export function asyncSome<T>(value: T): AsyncOption<T> {
    return AsyncOption.Some(value);
}

export function asyncNone(): AsyncOption<never> {
    return AsyncOption.None();
}

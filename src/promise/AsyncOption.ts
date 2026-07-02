import type { IOption } from '../Option.js';
import { Option } from '../Option.js';

/**
 * An **asynchronous** Option — a lazy `Promise<IOption<T>>`
 * with a fluent, composable API that mirrors {@link Option}.
 *
 * ## Why AsyncOption?
 *
 * Like `AsyncResult`, `AsyncOption` eliminates the noise of double-awaiting
 * `Promise<IOption<T>>` in async workflows.
 *
 * @typeParam T — The contained value type
 */
export class AsyncOption<T> {
    readonly #promise: Promise<IOption<T>>;

    private constructor(promise: Promise<IOption<T>>) {
        this.#promise = promise;
    }

    // ── Thenable protocol ──────────────────────────────────────────────

    then<TResult1 = IOption<T>, TResult2 = never>(
        onfulfilled?:
            | ((value: IOption<T>) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined,
    ): Promise<TResult1 | TResult2> {
        return this.#promise.then(onfulfilled, onrejected);
    }

    // ── Static factories ───────────────────────────────────────────────

    static Some<T>(value: T): AsyncOption<T> {
        return new AsyncOption(Promise.resolve(Option.Some(value)));
    }

    static None(): AsyncOption<never> {
        return new AsyncOption(Promise.resolve(Option.None()));
    }

    static From<T>(option: IOption<T>): AsyncOption<T> {
        return new AsyncOption(Promise.resolve(option));
    }

    static FromPromise<T>(promise: Promise<T | null | undefined>): AsyncOption<T> {
        return new AsyncOption(
            promise
                .then(v => (v === null || v === undefined ? Option.None() : Option.Some(v)))
                .catch(() => Option.None()),
        );
    }

    // ── Instance methods ───────────────────────────────────────────────

    map<U>(fn: (value: T) => U): AsyncOption<U> {
        return new AsyncOption(
            this.#promise.then(opt => {
                if (!opt.isSome) return opt as unknown as IOption<U>;
                try {
                    return Option.Some(fn(opt.value));
                } catch (e: unknown) {
                    return Option.None();
                }
            }),
        );
    }

    mapAsync<U>(fn: (value: T) => Promise<U>): AsyncOption<U> {
        return new AsyncOption(
            this.#promise.then(async opt => {
                if (!opt.isSome) return opt as unknown as IOption<U>;
                try {
                    const value = await fn(opt.value);
                    return Option.Some(value);
                } catch (e: unknown) {
                    return Option.None();
                }
            }),
        );
    }

    andThen<U>(fn: (value: T) => AsyncOption<U> | IOption<U> | Promise<IOption<U>>): AsyncOption<U> {
        return new AsyncOption(
            this.#promise.then(async opt => {
                if (!opt.isSome) return opt as unknown as IOption<U>;
                try {
                    const result = fn(opt.value);
                    if (result instanceof AsyncOption) {
                        return result.toPromise();
                    }
                    return result;
                } catch (e: unknown) {
                    return Option.None();
                }
            }),
        );
    }

    orElse(fn: () => AsyncOption<T> | IOption<T> | Promise<IOption<T>>): AsyncOption<T> {
        return new AsyncOption(
            this.#promise.then(async opt => {
                if (opt.isSome) return opt;
                try {
                    const result = fn();
                    if (result instanceof AsyncOption) {
                        return result.toPromise();
                    }
                    return result;
                } catch (e: unknown) {
                    return Option.None();
                }
            }),
        );
    }

    match<U>(onSome: (value: T) => U, onNone: () => U): Promise<U> {
        return this.#promise.then(opt => (opt.isSome ? onSome(opt.value) : onNone()));
    }

    tap(fn: (value: T) => void): AsyncOption<T> {
        return new AsyncOption(
            this.#promise.then(opt => {
                if (opt.isSome) {
                    try {
                        fn(opt.value);
                    } catch {
                        return Option.None();
                    }
                }
                return opt;
            }),
        );
    }

    unwrapOr(defaultValue: T): Promise<T> {
        return this.#promise.then(opt => (opt.isSome ? opt.value : defaultValue));
    }

    flatten(): T extends AsyncOption<infer U>
        ? AsyncOption<U>
        : T extends IOption<infer U>
        ? AsyncOption<U>
        : never {
        return new AsyncOption(
            this.#promise.then(async opt => {
                if (!opt.isSome) return opt as any;
                const inner = opt.value;
                if (inner instanceof AsyncOption) {
                    return inner.toPromise();
                }
                return inner as any;
            }),
        ) as any;
    }

    toPromise(): Promise<IOption<T>> {
        return this.#promise;
    }
}

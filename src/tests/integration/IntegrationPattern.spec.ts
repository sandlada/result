import { describe, it, expect } from 'vitest';
import { ok, err } from '../../index.js';
import type { IResult } from '../../types/IResult.js';
import type { IResultOfT } from '../../types/IResultOfT.js';

type AppError =
    | { kind: 'NotFound'; resource: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

type SubError = { code: string; detail: string };

function convertToAppError(e: SubError): AppError {
    return { kind: 'Validation', fields: { [e.code]: e.detail } };
}

describe('Integration: Type Alias', () => {
    type AppResult<T = void> = IResultOfT<T, AppError>;

    it('type alias resolves correctly', () => {
        function createUser(): AppResult<{ id: number }> {
            return ok({ id: 1 }) as unknown as AppResult<{ id: number }>;
        }
        const r = createUser();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) {
            expect(r.value.id).toBe(1);
        }
    });

    it('type alias works with failure', () => {
        function findUser(id: string): AppResult<{ id: number; name: string }> {
            if (!id) {
                return err<{ id: number; name: string }, AppError>({
                    kind: 'Validation',
                    fields: { id: 'Required' },
                });
            }
            return ok({ id: 1, name: 'Alice' }) as unknown as AppResult<{ id: number; name: string }>;
        }

        const r = findUser('');
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('Validation');
        }
    });
});

describe('Integration: Convenience Factory', () => {
    type AppResult<T = void> = IResultOfT<T, AppError>;

    const AppResult = {
        Success<T = void>(value?: T): AppResult<T> {
            if (value === undefined) return ok() as unknown as AppResult<T>;
            return ok(value) as unknown as AppResult<T>;
        },
        Failure(error: AppError): AppResult<never> {
            return err(error) as AppResult<never>;
        },
    } as const;

    const Appok = AppResult.Success;
    const Apperr = AppResult.Failure;

    describe('Success (void)', () => {
        it('returns success without value', () => {
            const ok = Appok();
            expect(ok.isSuccess).toBe(true);
        });
    });

    describe('Success<T>(value)', () => {
        it('returns success with value', () => {
            const ok = Appok({ id: 1, name: 'Alice' });
            expect(ok.isSuccess).toBe(true);
            if (ok.isSuccess) {
                expect(ok.value.name).toBe('Alice');
            }
        });

        it('works with primitive values', () => {
            const ok = Appok(42);
            expect(ok.isSuccess).toBe(true);
            if (ok.isSuccess) {
                expect(ok.value).toBe(42);
            }
        });
    });

    describe('Failure(error)', () => {
        it('returns failure without explicit generics', () => {
            const err = Apperr({
                kind: 'Validation',
                fields: { email: 'Invalid format' },
            });
            expect(err.isFailure).toBe(true);
            if (err.isFailure) {
                expect(err.error.kind).toBe('Validation');
            }
        });
    });

    describe('no generic parameters needed', () => {
        function getUser(id: string): AppResult<{ id: number; name: string }> {
            if (!id) {
                return Apperr({
                    kind: 'Validation',
                    fields: { id: 'Required' },
                });
            }
            return Appok({ id: 1, name: 'Alice' });
        }

        it('success path', () => {
            const r = getUser('42');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.name).toBe('Alice');
            }
        });

        it('failure path', () => {
            const r = getUser('');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('Validation');
            }
        });
    });
});

describe('Integration: never assignability', () => {
    type AppResult<T = void> = IResultOfT<T, AppError>;

    const AppResult = {
        Success<T = void>(value?: T): AppResult<T> {
            if (value === undefined) return ok() as unknown as AppResult<T>;
            return ok(value) as unknown as AppResult<T>;
        },
        Failure(error: AppError): AppResult<never> {
            return err(error) as AppResult<never>;
        },
    } as const;

    const Appok = AppResult.Success;
    const Apperr = AppResult.Failure;

    it('Failure (never) is assignable to any AppResult<T>', () => {
        function tryParse(input: string): AppResult<number> {
            const n = Number(input);
            if (isNaN(n)) return Apperr({ kind: 'Validation', fields: { input: 'NaN' } });
            return Appok(n);
        }

        const r = tryParse('42');
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe(42);

        const r2 = tryParse('abc');
        expect(r2.isFailure).toBe(true);
    });

    it('Failure can be returned from any value-typed function', () => {
        function getString(): AppResult<string> {
            return Apperr({ kind: 'NotFound', resource: 'String', id: 'x' });
        }
        function getNumber(): AppResult<number> {
            return Apperr({ kind: 'NotFound', resource: 'Number', id: 'y' });
        }

        expect(getString().isFailure).toBe(true);
        expect(getNumber().isFailure).toBe(true);
    });
});

describe('Integration: mapError()', () => {
    type AppResult<T = void> = IResultOfT<T, AppError>;

    const AppResult = {
        Success<T = void>(value?: T): AppResult<T> {
            if (value === undefined) return ok() as unknown as AppResult<T>;
            return ok(value) as unknown as AppResult<T>;
        },
        Failure(error: AppError): AppResult<never> {
            return err(error) as AppResult<never>;
        },
    } as const;

    const Appok = AppResult.Success;
    const Apperr = AppResult.Failure;

    function mapError<T>(result: IResultOfT<T, SubError>): AppResult<T> {
        if (result.isSuccess) return Appok(result.value);
        return Apperr(convertToAppError(result.error));
    }

    it('converts success transparently', () => {
        const subResult = ok('hello');
        const mapped = mapError(subResult as unknown as IResultOfT<string, SubError>);
        expect(mapped.isSuccess).toBe(true);
        if (mapped.isSuccess) {
            expect(mapped.value).toBe('hello');
        }
    });

    it('converts failure error', () => {
        const subResult = err<string, SubError>({ code: 'E1', detail: 'Oops' });
        const mapped = mapError(subResult);
        expect(mapped.isFailure).toBe(true);
        if (mapped.isFailure) {
            expect(mapped.error.kind).toBe('Validation');
            if (mapped.error.kind === 'Validation') {
                expect(mapped.error.fields.E1).toBe('Oops');
            }
        }
    });
});

describe('Integration: Type alias + Factory compose', () => {
    type AppResult<T = void> = IResultOfT<T, AppError>;

    const AppResult = {
        Success<T = void>(value?: T): AppResult<T> {
            if (value === undefined) return ok() as unknown as AppResult<T>;
            return ok(value) as unknown as AppResult<T>;
        },
        Failure(error: AppError): AppResult<never> {
            return err(error) as AppResult<never>;
        },
    } as const;

    const Appok = AppResult.Success;
    const Apperr = AppResult.Failure;

    it('type alias used in function signature', () => {
        function doWork(): AppResult<string> {
            return Appok('done');
        }
        const r = doWork();
        expect(r.isSuccess).toBe(true);
    });

    it('factory used without generics in body', () => {
        function mayFail(flag: boolean): AppResult<number> {
            if (flag) return Apperr({ kind: 'NotFound', resource: 'num', id: '0' });
            return Appok(1);
        }
        expect(mayFail(true).isFailure).toBe(true);
        expect(mayFail(false).isSuccess).toBe(true);
    });
});

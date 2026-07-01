import { describe, it, expect } from 'vitest';
import { Result } from '../src/Result.js';
import type { IResult } from '../src/IResult.js';

type AppError =
    | { kind: 'NotFound'; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

// ─── 1. Branching ───────────────────────────────────────────────

describe('Branching (if/else)', () => {
    it('success branch: value accessible', () => {
        const result = Result.Success(42);
        if (result.isSuccess) {
            const doubled = result.value * 2;
            expect(doubled).toBe(84);
        } else {
            expect.fail('should be success');
        }
    });

    it('failure branch: error accessible', () => {
        const result = Result.Failure<string, AppError>({ kind: 'NotFound', id: '1' });
        if (result.isFailure) {
            expect(result.error.kind).toBe('NotFound');
            expect(result.error.id).toBe('1');
        } else {
            expect.fail('should be failure');
        }
    });

    it('branching with discriminated union error', () => {
        function handle(r: IResult<string, AppError>): string {
            if (r.isSuccess) return r.value;
            switch (r.error.kind) {
                case 'NotFound': return `Not found: ${r.error.id}`;
                case 'Validation': return `Invalid: ${JSON.stringify(r.error.fields)}`;
            }
        }

        expect(handle(Result.Success('ok'))).toBe('ok');
        expect(handle(Result.Failure<string, AppError>({ kind: 'NotFound', id: 'x' }))).toBe('Not found: x');
    });
});

describe('Early return / error propagation', () => {
    it('propagates failure without unwrapping', () => {
        function validate(input: string): IResult<string, AppError> {
            if (!input) {
                return Result.Failure<string, AppError>({
                    kind: 'Validation',
                    fields: { input: 'Required' },
                });
            }
            return Result.Success(input.trim());
        }

        function process(input: string): IResult<{ value: string }, AppError> {
            const validated = validate(input);
            if (validated.isFailure) return validated;

            return Result.Success({ value: validated.value.toUpperCase() });
        }

        const r1 = process('hello');
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value.value).toBe('HELLO');

        const r2 = process('');
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error.kind).toBe('Validation');
    });

    it('chains multiple operations', () => {
        function fetchUser(): IResult<{ name: string }, AppError> {
            return Result.Success({ name: 'Alice' });
        }

        function validateUser(user: { name: string }): IResult<{ name: string }, AppError> {
            if (!user.name) {
                return Result.Failure<{ name: string }, AppError>({
                    kind: 'Validation',
                    fields: { name: 'Required' },
                });
            }
            return Result.Success(user);
        }

        function getValidUser(): IResult<{ name: string }, AppError> {
            const user = fetchUser();
            if (user.isFailure) return user;

            const validated = validateUser(user.value);
            if (validated.isFailure) return validated;

            return Result.Success(validated.value);
        }

        const r = getValidUser();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.name).toBe('Alice');
    });

    it('early return with different error type sub-system', () => {
        type SubError = { code: string };
        type MainError = { kind: 'SubSystemFailed'; cause: string };

        function subOperation(): IResult<number, SubError> {
            return Result.Failure<number, SubError>({ code: 'E500' });
        }

        function mainOperation(): IResult<string, MainError> {
            const sub = subOperation();
            if (sub.isFailure) {
                return Result.Failure<string, MainError>({
                    kind: 'SubSystemFailed',
                    cause: sub.error.code,
                });
            }
            return Result.Success(String(sub.value));
        }

        const r = mainOperation();
        expect(r.isFailure).toBe(true);
        if (r.isFailure) {
            expect(r.error.kind).toBe('SubSystemFailed');
            expect(r.error.cause).toBe('E500');
        }
    });
});

describe('Type narrowing', () => {
    it('value is narrowed after isSuccess check', () => {
        function handle(result: IResult<string, AppError>) {
            if (result.isSuccess) {
                const upper: string = result.value.toUpperCase();
                return upper;
            }
            return `Error: ${result.error.kind}`;
        }

        expect(handle(Result.Success('hello'))).toBe('HELLO');
    });

    it('error is narrowed after isFailure check', () => {
        function handle(result: IResult<string, AppError>) {
            if (result.isFailure) {
                const kind: AppError['kind'] = result.error.kind;
                return kind;
            }
            return result.value;
        }

        expect(handle(Result.Failure<string, AppError>({ kind: 'NotFound', id: 'x' }))).toBe('NotFound');
        expect(handle(Result.Success('ok'))).toBe('ok');
    });

    it('narrowing persists through return statements', () => {
        function transform(r: IResult<number, AppError>): IResult<string, AppError> {
            if (r.isFailure) return r;
            return Result.Success(String(r.value));
        }

        const ok = transform(Result.Success(42));
        expect(ok.isSuccess).toBe(true);
        if (ok.isSuccess) expect(ok.value).toBe('42');
    });
});

describe('Edge cases', () => {
    it('result with void value is just a status signal', () => {
        function maybeDo(): IResult<void, AppError> {
            return Result.Success(undefined);
        }

        const r = maybeDo();
        expect(r.isSuccess).toBe(true);
    });

    it('quick check pattern: inline if', () => {
        const ok = Result.Success(42);
        const result = ok.isSuccess ? ok.value : -1;
        expect(result).toBe(42);

        const err = Result.Failure<number>(new Error('fail'));
        const fallback = err.isSuccess ? err.value : -1;
        expect(fallback).toBe(-1);
    });

    it('void success as completion signal', () => {
        let sideEffect = false;
        function performAction(): IResult<void, AppError> {
            if (true) {
                sideEffect = true;
                return Result.Success(undefined);
            }
            return Result.Failure<void, AppError>({ kind: 'NotFound', id: 'action' });
        }

        const r = performAction();
        expect(r.isSuccess).toBe(true);
        expect(sideEffect).toBe(true);
    });
});

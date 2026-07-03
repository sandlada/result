import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResult } from '../src/types/IResult.js';
import type { IResultOfT } from '../src/types/IResultOfT.js';

type AppError =
    | { kind: 'NotFound'; id: string }
    | { kind: 'Validation'; fields: Record<string, string> };

// ─── 1. Branching ───────────────────────────────────────────────

describe('Branching (if/else)', () => {
    it('success branch: value accessible', () => {
        const result = ok(42);
        if (result.isSuccess) {
            const doubled = result.value * 2;
            expect(doubled).toBe(84);
        } else {
            expect.fail('should be success');
        }
    });

    it('failure branch: error accessible', () => {
        const result = err<string, AppError>({ kind: 'NotFound', id: '1' });
        if (result.isFailure) {
            expect(result.error.kind).toBe('NotFound');
            if (result.error.kind === 'NotFound') {
                expect(result.error.id).toBe('1');
            }
        } else {
            expect.fail('should be failure');
        }
    });

    it('branching with discriminated union error', () => {
        function handle(r: IResultOfT<string, AppError>): string {
            if (r.isSuccess) return r.value;
            switch (r.error.kind) {
                case 'NotFound': return `Not found: ${r.error.id}`;
                case 'Validation': return `Invalid: ${JSON.stringify(r.error.fields)}`;
            }
        }

        expect(handle(ok('ok') as unknown as IResultOfT<string, AppError>)).toBe('ok');
        expect(handle(err<string, AppError>({ kind: 'NotFound', id: 'x' }))).toBe('Not found: x');
    });
});

describe('Early return / error propagation', () => {
    it('propagates failure without unwrapping', () => {
        function validate(input: string): IResultOfT<string, AppError> {
            if (!input) {
                return err<string, AppError>({
                    kind: 'Validation',
                    fields: { input: 'Required' },
                });
            }
            return ok(input.trim()) as unknown as IResultOfT<string, AppError>;
        }

        function process(input: string): IResultOfT<{ value: string }, AppError> {
            const validated = validate(input);
            if (validated.isFailure) return validated as unknown as IResultOfT<{ value: string }, AppError>;

            return ok({ value: validated.value.toUpperCase() }) as unknown as IResultOfT<{ value: string }, AppError>;
        }

        const r1 = process('hello');
        expect(r1.isSuccess).toBe(true);
        if (r1.isSuccess) expect(r1.value.value).toBe('HELLO');

        const r2 = process('');
        expect(r2.isFailure).toBe(true);
        if (r2.isFailure) expect(r2.error.kind).toBe('Validation');
    });

    it('chains multiple operations', () => {
        function fetchUser(): IResultOfT<{ name: string }, AppError> {
            return ok({ name: 'Alice' }) as unknown as IResultOfT<{ name: string }, AppError>;
        }

        function validateUser(user: { name: string }): IResultOfT<{ name: string }, AppError> {
            if (!user.name) {
                return err<{ name: string }, AppError>({
                    kind: 'Validation',
                    fields: { name: 'Required' },
                });
            }
            return ok(user) as unknown as IResultOfT<{ name: string }, AppError>;
        }

        function getValidUser(): IResultOfT<{ name: string }, AppError> {
            const user = fetchUser();
            if (user.isFailure) return user;

            const validated = validateUser(user.value);
            if (validated.isFailure) return validated;

            return ok(validated.value) as unknown as IResultOfT<{ name: string }, AppError>;
        }

        const r = getValidUser();
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value.name).toBe('Alice');
    });

    it('early return with different error type sub-system', () => {
        type SubError = { code: string };
        type MainError = { kind: 'SubSystemFailed'; cause: string };

        function subOperation(): IResultOfT<number, SubError> {
            return err<number, SubError>({ code: 'E500' });
        }

        function mainOperation(): IResultOfT<string, MainError> {
            const sub = subOperation();
            if (sub.isFailure) {
                return err<string, MainError>({
                    kind: 'SubSystemFailed',
                    cause: sub.error.code,
                });
            }
            return ok(String(sub.value)) as unknown as IResultOfT<string, MainError>;
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
        function handle(result: IResultOfT<string, AppError>) {
            if (result.isSuccess) {
                const upper: string = result.value.toUpperCase();
                return upper;
            }
            return `Error: ${result.error.kind}`;
        }

        expect(handle(ok('hello') as unknown as IResultOfT<string, AppError>)).toBe('HELLO');
    });

    it('error is narrowed after isFailure check', () => {
        function handle(result: IResultOfT<string, AppError>) {
            if (result.isFailure) {
                const kind: AppError['kind'] = result.error.kind;
                return kind;
            }
            return result.value;
        }

        expect(handle(err<string, AppError>({ kind: 'NotFound', id: 'x' }))).toBe('NotFound');
        expect(handle(ok('ok') as unknown as IResultOfT<string, AppError>)).toBe('ok');
    });

    it('narrowing persists through return statements', () => {
        function transform(r: IResultOfT<number, AppError>): IResultOfT<string, AppError> {
            if (r.isFailure) return r as unknown as IResultOfT<string, AppError>;
            return ok(String(r.value)) as unknown as IResultOfT<string, AppError>;
        }

        const r = transform(ok(42) as unknown as IResultOfT<number, AppError>);
        expect(r.isSuccess).toBe(true);
        if (r.isSuccess) expect(r.value).toBe('42');
    });
});

describe('Edge cases', () => {
    it('result with void value is just a status signal', () => {
        function maybeDo(): IResultOfT<void, AppError> {
            return ok(undefined) as unknown as IResultOfT<void, AppError>;
        }

        const r = maybeDo();
        expect(r.isSuccess).toBe(true);
    });

    it('quick check pattern: inline if', () => {
        const r1 = ok(42);
        const result = r1.isSuccess ? r1.value : -1;
        expect(result).toBe(42);

        const r2 = err<number, Error>(new Error('fail'));
        const fallback = r2.isSuccess ? r2.value : -1;
        expect(fallback).toBe(-1);
    });

    it('void success as completion signal', () => {
        let sideEffect = false;
        function performAction(): IResultOfT<void, AppError> {
            if (true) {
                sideEffect = true;
                return ok(undefined) as unknown as IResultOfT<void, AppError>;
            }
            return err<void, AppError>({ kind: 'NotFound', id: 'action' });
        }

        const r = performAction();
        expect(r.isSuccess).toBe(true);
        expect(sideEffect).toBe(true);
    });
});


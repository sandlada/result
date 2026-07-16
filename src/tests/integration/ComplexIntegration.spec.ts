import { describe, it, expect } from 'vitest';
import { ok, err } from '../../index.js';
import type { IResultOfT, IResultOfTSuccess } from '../../types/IResultOfT.js';

type DomainError =
    | { kind: 'NotFound'; entity: string; id: string }
    | { kind: 'Validation'; fields: Record<string, string> }
    | { kind: 'Conflict'; entity: string; id: string };

type InfraError =
    | { kind: 'DbTimeout'; duration: number }
    | { kind: 'ConnectionLost'; host: string };

type AppError =
    | { kind: 'Domain'; inner: DomainError }
    | { kind: 'Infrastructure'; inner: InfraError };

type HttpResponse<T = void> =
    | { status: 200; data: T }
    | { status: 201; data: T }
    | { status: 400; message: string }
    | { status: 404; message: string }
    | { status: 409; message: string }
    | { status: 500; message: string };

type DomainResult<T = void> = IResultOfT<T, DomainError>;
type InfraResult<T = void> = IResultOfT<T, InfraError>;
type AppResult<T = void> = IResultOfT<T, AppError>;

const DomainResult = {
    Success<T = void>(value?: T): DomainResult<T> {
        if (arguments.length === 0) return ok() as unknown as DomainResult<T>;
        return ok(value!) as unknown as DomainResult<T>;
    },
    Failure(error: DomainError): DomainResult<never> {
        return err(error) as unknown as DomainResult<never>;
    },
} as const;

const InfraResult = {
    Success<T = void>(value?: T): InfraResult<T> {
        if (arguments.length === 0) return ok() as unknown as InfraResult<T>;
        return ok(value!) as unknown as InfraResult<T>;
    },
    Failure(error: InfraError): InfraResult<never> {
        return err(error) as unknown as InfraResult<never>;
    },
} as const;

const AppResult = {
    Success<T = void>(value?: T): AppResult<T> {
        if (arguments.length === 0) return ok() as unknown as AppResult<T>;
        return ok(value!) as unknown as AppResult<T>;
    },
    Failure(error: AppError): AppResult<never> {
        return err(error) as unknown as AppResult<never>;
    },
} as const;

const Domainok = DomainResult.Success;
const Domainerr = DomainResult.Failure;
const Infraok = InfraResult.Success;
const Infraerr = InfraResult.Failure;
const Appok = AppResult.Success;
const Apperr = AppResult.Failure;

function domainToApp<T>(r: DomainResult<T>): AppResult<T> {
    if (r.isSuccess) return Appok(r.value);
    return Apperr({ kind: 'Domain', inner: r.error });
}

function infraToApp<T>(r: InfraResult<T>): AppResult<T> {
    if (r.isSuccess) return Appok(r.value);
    return Apperr({ kind: 'Infrastructure', inner: r.error });
}

describe('Multi-Layer Service Composition', () => {
    const db: Record<string, { id: string; name: string; email: string }> = {
        '1': { id: '1', name: 'Alice', email: 'alice@example.com' },
    };

    class UserRepository {
        findById(id: string): InfraResult<{ id: string; name: string; email: string }> {
            if (id === 'timeout') {
                return Infraerr({ kind: 'DbTimeout', duration: 5000 });
            }
            if (id === 'connection') {
                return Infraerr({ kind: 'ConnectionLost', host: 'db01' });
            }
            const user = db[id];
            if (!user) {
                return Infraok(user!);
            }
            return Infraok(user);
        }
    }

    class UserService {
        constructor(private repo: UserRepository) {}

        getUser(id: string): DomainResult<{ id: string; name: string; email: string }> {
            if (!id) {
                return Domainerr({
                    kind: 'Validation',
                    fields: { id: 'Required' },
                });
            }

            const repoResult = this.repo.findById(id);
            if (!repoResult.isSuccess) return repoResult as unknown as DomainResult<{ id: string; name: string; email: string; }>;

            const user = repoResult.value;
            if (!user) {
                return Domainerr({
                    kind: 'NotFound',
                    entity: 'User',
                    id,
                });
            }

            return Domainok(user);
        }

        validateEmail(email: string): DomainResult<string> {
            if (!email.includes('@')) {
                return Domainerr({
                    kind: 'Validation',
                    fields: { email: 'Invalid format' },
                });
            }
            return Domainok(email.toLowerCase().trim());
        }
    }

    class UserController {
        constructor(private service: UserService) {}

        getUser(id: string): AppResult<HttpResponse<{ name: string; email: string }>> {
            const result = this.service.getUser(id);
            const mapped = domainToApp(result);

            if (!mapped.isSuccess) {
                return mapAppErrorToHttpResponse(mapped.error) as unknown as AppResult<HttpResponse<{ name: string; email: string }>>;
            }

            return Appok({
                status: 200,
                data: {
                    name: mapped.value.name,
                    email: mapped.value.email,
                },
            });
        }
    }

    function mapAppErrorToHttpResponse(e: AppError): AppResult<HttpResponse> {
        if (e.kind === 'Domain') {
            switch (e.inner.kind) {
                case 'NotFound':
                    return Appok({
                        status: 404,
                        message: `${e.inner.entity} ${e.inner.id} not found`,
                    } as HttpResponse);
                case 'Validation':
                    return Appok({
                        status: 400,
                        message: `Validation error: ${JSON.stringify(e.inner.fields)}`,
                    } as HttpResponse);
                default:
                    return Appok({ status: 500, message: 'Unknown domain error' } as HttpResponse);
            }
        }
        return Appok({ status: 500, message: 'Internal server error' } as HttpResponse);
    }

    const repo = new UserRepository();
    const service = new UserService(repo);
    const controller = new UserController(service);

    describe('happy path: all layers succeed', () => {
        it('returns 200 with user data', () => {
            const r = controller.getUser('1');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.status).toBe(200);
                if (r.value.status === 200) {
                    expect(r.value.data.name).toBe('Alice');
                    expect(r.value.data.email).toBe('alice@example.com');
                }
            }
        });
    });

    describe('domain error: validation at service layer', () => {
        it('empty id → 400 via domain→app→http mapping', () => {
            const r = controller.getUser('');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.status).toBe(400);
                if (r.value.status === 400) {
                    expect(r.value.message).toContain('Validation');
                }
            }
        });
    });

    describe('domain error: not found at service layer', () => {
        it('unknown id → 404', () => {
            const r = controller.getUser('999');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.status).toBe(404);
                if (r.value.status === 404) {
                    expect(r.value.message).toContain('User');
                    expect(r.value.message).toContain('999');
                }
            }
        });
    });

    describe('infra error: db timeout propagated up', () => {
        it('timeout → 500 with infrastructure cause', () => {
            const r = controller.getUser('timeout');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.status).toBe(500);
            }
        });
    });

    describe('infra error: connection lost', () => {
        it('connection error → 500', () => {
            const r = controller.getUser('connection');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.status).toBe(500);
            }
        });
    });

    describe('three-layer error identity preservation', () => {
        it('domain NotFound traverses all 3 layers intact', () => {
            const svcResult = service.getUser('999');
            expect(svcResult.isFailure).toBe(true);
            if (svcResult.isFailure) {
                expect(svcResult.error.kind).toBe('NotFound');
            }

            const appResult = domainToApp(svcResult);
            expect(appResult.isFailure).toBe(true);
            if (appResult.isFailure) {
                expect(appResult.error.kind).toBe('Domain');
                if (appResult.error.kind === 'Domain') {
                    expect(appResult.error.inner.kind).toBe('NotFound');
                }
            }

            const ctrlResult = controller.getUser('999');
            expect(ctrlResult.isSuccess).toBe(true);
            if (ctrlResult.isSuccess) {
                expect(ctrlResult.value.status).toBe(404);
            }
        });
    });
});

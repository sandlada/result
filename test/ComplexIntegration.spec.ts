import { describe, it, expect } from 'vitest';
import { ok, err } from '../src/index.js';
import type { IResultOfT, IResultOfTSuccess } from '../src/types/IResultOfT.js';

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
                expect(appResult.error.inner.kind).toBe('NotFound');
            }
        });
    });
});

describe('Railway-Oriented Pipelining', () => {
    type AppError =
        | { kind: 'ParseError'; raw: string }
        | { kind: 'InvalidRange'; min: number; max: number; actual: number }
        | { kind: 'SaveFailed'; id: string; reason: string };

    type AppResult<T = void> = IResultOfT<T, AppError>;

    const AppResult = {
        Success<T = void>(value?: T): AppResult<T> {
            if (arguments.length === 0) return ok() as unknown as AppResult<T>;
            return ok(value!) as unknown as AppResult<T>;
        },
        Failure(error: AppError): AppResult<never> {
            return err(error) as unknown as AppResult<never>;
        },
    } as const;

    const Appok = AppResult.Success;
    const Apperr = AppResult.Failure;

    function map<T, U, E>(result: IResultOfT<T, E>, fn: (value: T) => U): IResultOfT<U, E> {
        if (!result.isSuccess) return result as unknown as IResultOfT<U, E>;
        return ok(fn(result.value)) as unknown as IResultOfT<U, E>;
    }

    function flatMap<T, U, E>(
        result: IResultOfT<T, E>,
        fn: (value: T) => IResultOfT<U, E>,
    ): IResultOfT<U, E> {
        if (!result.isSuccess) return result as unknown as IResultOfT<U, E>;
        return fn(result.value);
    }

    function tap<T, E>(result: IResultOfT<T, E>, fn: (value: T) => void): IResultOfT<T, E> {
        if (result.isSuccess) fn(result.value);
        return result;
    }

    function parse(input: string): AppResult<number> {
        const n = Number(input);
        if (isNaN(n)) return Apperr({ kind: 'ParseError', raw: input });
        return Appok(n);
    }

    function validateRange(min: number, max: number): (n: number) => AppResult<number> {
        return (n: number) => {
            if (n < min || n > max) {
                return Apperr({ kind: 'InvalidRange', min, max, actual: n });
            }
            return Appok(n);
        };
    }

    function double(n: number): number {
        return n * 2;
    }

    function save(id: string): (n: number) => AppResult<{ id: string; value: number }> {
        return (n: number) => {
            if (id === 'fail') {
                return Apperr({ kind: 'SaveFailed', id, reason: 'disk full' });
            }
            return Appok({ id, value: n });
        };
    }

    describe('full pipeline: parse → validate → double → save', () => {
        it('happy path: all steps succeed', () => {
            const result = flatMap(
                flatMap(
                    map(parse('21'), double),
                    validateRange(1, 100),
                ),
                save('record-1'),
            );

            expect(result.isSuccess).toBe(true);
            if (result.isSuccess) {
                expect(result.value.id).toBe('record-1');
                expect(result.value.value).toBe(42);
            }
        });
    });

    describe('short-circuit on parse failure', () => {
        it('stops at first failure — map/validate/save not reached', () => {
            const calls: string[] = [];
            const trackedValidateRange = (min: number, max: number) => (n: number): AppResult<number> => {
                calls.push('validate');
                return validateRange(min, max)(n);
            };
            const trackedSave = (id: string) => (n: number): AppResult<{ id: string; value: number }> => {
                calls.push('save');
                return save(id)(n);
            };

            const result = flatMap(
                flatMap(
                    map(parse('abc'), (n) => { calls.push('map'); return n; }),
                    trackedValidateRange(1, 100),
                ),
                trackedSave('x'),
            );

            expect(result.isFailure).toBe(true);
            if (result.isFailure) {
                expect(result.error.kind).toBe('ParseError');
            }
            expect(calls).toEqual([]);
        });
    });

    describe('short-circuit on validation failure', () => {
        it('parse succeeds, validate fails, transform/save skipped', () => {
            const calls: string[] = [];
            const trackedDouble = (n: number) => { calls.push('double'); return n * 2; };
            const trackedSave = (id: string) => (n: number): AppResult<{ id: string; value: number }> => {
                calls.push('save');
                return save(id)(n);
            };

            const result = flatMap(
                flatMap(
                    map(parse('500'), trackedDouble),
                    validateRange(1, 100),
                ),
                trackedSave('x'),
            );

            expect(result.isFailure).toBe(true);
            if (result.isFailure) {
                expect(result.error.kind).toBe('InvalidRange');
            }
            // double should have run, but save should not
            expect(calls).toEqual(['double']);
        });
    });

    describe('short-circuit on save failure', () => {
        it('all transforms succeed, save fails', () => {
            const result = flatMap(
                flatMap(
                    map(parse('10'), double),
                    validateRange(1, 100),
                ),
                save('fail'),
            );

            expect(result.isFailure).toBe(true);
            if (result.isFailure) {
                expect(result.error.kind).toBe('SaveFailed');
            }
        });
    });

    describe('tap: side effects on success', () => {
        it('executes side effect without changing the value', () => {
            const sideEffects: number[] = [];
            const r = tap(
                tap(parse('7'), (n) => sideEffects.push(n)),
                (n) => sideEffects.push(n * 10),
            );

            expect(r.isSuccess).toBe(true);
            expect(sideEffects).toEqual([7, 70]);
        });

        it('does not execute side effect on failure', () => {
            let called = false;
            const r = tap(parse('x'), () => { called = true; });
            expect(r.isFailure).toBe(true);
            expect(called).toBe(false);
        });
    });

    describe('composition: built-in pipeline function', () => {
        function pipeParseValidateSave(input: string): AppResult<{ id: string; value: number }> {
            return flatMap(
                flatMap(
                    map(parse(input), double),
                    validateRange(1, 100),
                ),
                save('composed'),
            );
        }

        it('valid input through full pipe', () => {
            const r = pipeParseValidateSave('15');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value.value).toBe(30);
        });

        it('invalid range through pipe', () => {
            const r = pipeParseValidateSave('999');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error.kind).toBe('InvalidRange');
        });

        it('non-number through pipe', () => {
            const r = pipeParseValidateSave('hello');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) expect(r.error.kind).toBe('ParseError');
        });
    });
});

describe('Result Combining / Aggregation', () => {
    type ValidationError = { field: string; message: string };
    type CombinedResult<T = void> = IResultOfT<T, ValidationError[]>;

    const CombinedResult = {
        Success<T = void>(value?: T): CombinedResult<T> {
            if (arguments.length === 0) return ok() as unknown as CombinedResult<T>;
            return ok(value!) as unknown as CombinedResult<T>;
        },
        Failure(errors: ValidationError[]): CombinedResult<never> {
            return err(errors) as unknown as CombinedResult<never>;
        },
    } as const;

    const Combinedok = CombinedResult.Success;
    const Combinederr = CombinedResult.Failure;

    function validateName(name: string): CombinedResult<string> {
        const errors: ValidationError[] = [];
        if (!name) errors.push({ field: 'name', message: 'Required' });
        if (name.length > 100) errors.push({ field: 'name', message: 'Too long' });
        if (errors.length > 0) return Combinederr(errors);
        return Combinedok(name.trim());
    }

    function validateEmail(email: string): CombinedResult<string> {
        const errors: ValidationError[] = [];
        if (!email) errors.push({ field: 'email', message: 'Required' });
        if (!email.includes('@')) errors.push({ field: 'email', message: 'Invalid format' });
        if (errors.length > 0) return Combinederr(errors);
        return Combinedok(email.toLowerCase());
    }

    function validateAge(age: number | undefined): CombinedResult<number> {
        const errors: ValidationError[] = [];
        if (age === undefined || age === null) errors.push({ field: 'age', message: 'Required' });
        else if (age < 0) errors.push({ field: 'age', message: 'Must be non-negative' });
        else if (age > 150) errors.push({ field: 'age', message: 'Must be realistic' });
        if (errors.length > 0) return Combinederr(errors);
        return Combinedok(age!);
    }

    interface UserInput {
        name: string;
        email: string;
        age: number | undefined;
    }

    interface ValidUser {
        name: string;
        email: string;
        age: number;
    }

    function combineValidations(
        results: [CombinedResult<string>, CombinedResult<string>, CombinedResult<number>],
    ): CombinedResult<ValidUser> {
        const allErrors: ValidationError[] = [];

        const [nameR, emailR, ageR] = results;

        if (!nameR.isSuccess) allErrors.push(...nameR.error);
        if (!emailR.isSuccess) allErrors.push(...emailR.error);
        if (!ageR.isSuccess) allErrors.push(...ageR.error);

        if (allErrors.length > 0) return Combinederr(allErrors);

        return Combinedok({
            name: (nameR as IResultOfTSuccess<string, ValidationError[]>).value,
            email: (emailR as IResultOfTSuccess<string, ValidationError[]>).value,
            age: (ageR as IResultOfTSuccess<number, ValidationError[]>).value,
        });
    }

    describe('all validations pass', () => {
        it('returns combined success payload', () => {
            const r = combineValidations([
                validateName('Alice'),
                validateEmail('alice@example.com'),
                validateAge(30),
            ]);

            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value).toEqual({
                    name: 'Alice',
                    email: 'alice@example.com',
                    age: 30,
                });
            }
        });
    });

    describe('single field fails', () => {
        it('collects one error', () => {
            const r = combineValidations([
                validateName('Alice'),
                validateEmail('not-an-email'),
                validateAge(30),
            ]);

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error).toHaveLength(1);
                expect(r.error[0]!.field).toBe('email');
            }
        });
    });

    describe('multiple fields fail', () => {
        it('collects all errors from all fields', () => {
            const r = combineValidations([
                validateName(''),
                validateEmail('bad'),
                validateAge(-5),
            ]);

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error).toHaveLength(3);
                const fields = r.error.map((e) => e.field);
                expect(fields).toContain('name');
                expect(fields).toContain('email');
                expect(fields).toContain('age');
            }
        });
    });

    describe('partial failure: 2 of 3 fields bad', () => {
        it('collects exactly 2 errors', () => {
            const r = combineValidations([
                validateName('Bob'),
                validateEmail('bad-email'),
                validateAge(-1),
            ]);

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error).toHaveLength(2);
                const fields = r.error.map((e) => e.field).sort();
                expect(fields).toEqual(['age', 'email']);
            }
        });
    });

    describe('edge: empty name and very long name combined', () => {
        it('reports the first encountered error per field', () => {
            const r = validateName('');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error).toHaveLength(1);
                expect(r.error[0]!.message).toBe('Required');
            }
        });
    });

    describe('edge: trim is applied on valid name', () => {
        it('trims whitespace', () => {
            const r = validateName('  Alice  ');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) expect(r.value).toBe('Alice');
        });
    });
});

describe('Transaction-Like Pattern', () => {
    type TxError =
        | { kind: 'InventoryShortage'; sku: string; requested: number; available: number }
        | { kind: 'PaymentDeclined'; amount: number; reason: string }
        | { kind: 'OrderCreationFailed'; reason: string };

    type TxResult<T = void> = IResultOfT<T, TxError>;

    const TxResult = {
        Success<T = void>(value?: T): TxResult<T> {
            if (arguments.length === 0) return ok() as unknown as TxResult<T>;
            return ok(value!) as unknown as TxResult<T>;
        },
        Failure(error: TxError): TxResult<never> {
            return err(error) as unknown as TxResult<never>;
        },
    } as const;

    const Txok = TxResult.Success;
    const Txerr = TxResult.Failure;

    interface Inventory {
        [sku: string]: number;
    }

    class OrderService {
        private inventory: Inventory = { 'SKU-A': 10, 'SKU-B': 5, broken: 1 };
        private paymentLog: string[] = [];
        private orderLog: Array<{ id: string; sku: string; qty: number }> = [];

        get inventoryState(): Inventory {
            return { ...this.inventory };
        }

        get payments(): ReadonlyArray<string> {
            return this.paymentLog;
        }

        get orders(): ReadonlyArray<{ id: string; sku: string; qty: number }> {
            return this.orderLog;
        }

        // Step 1: Reserve inventory
        reserve(sku: string, qty: number): TxResult<void> {
            const available = this.inventory[sku] ?? 0;
            if (available < qty) {
                return Txerr({
                    kind: 'InventoryShortage',
                    sku,
                    requested: qty,
                    available,
                });
            }
            this.inventory[sku] = available - qty;
            return Txok();
        }

        // Compensation: release reserved inventory
        release(sku: string, qty: number): void {
            this.inventory[sku] = (this.inventory[sku] ?? 0) + qty;
        }

        // Step 2: Charge payment
        charge(amount: number, cardToken: string): TxResult<string> {
            if (cardToken === 'declined') {
                return Txerr({
                    kind: 'PaymentDeclined',
                    amount,
                    reason: 'Insufficient funds',
                });
            }
            if (cardToken === 'error') {
                return Txerr({
                    kind: 'PaymentDeclined',
                    amount,
                    reason: 'Gateway timeout',
                });
            }
            const txId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            this.paymentLog.push(txId);
            return Txok(txId);
        }

        // Compensation: refund payment
        refund(txId: string): void {
            this.paymentLog.push(`REFUND:${txId}`);
        }

        // Step 3: Create order
        createOrder(sku: string, qty: number, paymentTxId: string): TxResult<string> {
            if (sku === 'broken') {
                return Txerr({
                    kind: 'OrderCreationFailed',
                    reason: 'Database constraint violation',
                });
            }
            const orderId = `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
            this.orderLog.push({ id: orderId, sku, qty });
            return Txok(orderId);
        }

        placeOrder(
            sku: string,
            qty: number,
            amount: number,
            cardToken: string,
        ): TxResult<{ orderId: string; paymentTxId: string }> {
            const reserved = this.reserve(sku, qty);
            if (!reserved.isSuccess) return reserved as unknown as TxResult<{ orderId: string; paymentTxId: string }>;

            const charged = this.charge(amount, cardToken);
            if (!charged.isSuccess) {
                this.release(sku, qty);
                return charged as unknown as TxResult<{ orderId: string; paymentTxId: string }>;
            }

            const order = this.createOrder(sku, qty, charged.value);
            if (!order.isSuccess) {
                this.release(sku, qty);
                this.refund(charged.value);
                return order as unknown as TxResult<{ orderId: string; paymentTxId: string }>;
            }

            return Txok({
                orderId: order.value,
                paymentTxId: charged.value,
            });
        }
    }

    describe('happy path: all three steps succeed', () => {
        it('reserves inventory, charges payment, creates order', () => {
            const svc = new OrderService();
            const r = svc.placeOrder('SKU-A', 3, 99.99, 'valid-card');

            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.orderId).toMatch(/^ORD-/);
                expect(r.value.paymentTxId).toMatch(/^txn_/);
            }

            expect(svc.inventoryState['SKU-A']).toBe(7);
            expect(svc.payments.length).toBe(1);
            expect(svc.payments[0]).not.toContain('REFUND');
            expect(svc.orders.length).toBe(1);
        });
    });

    describe('failure at step 1: inventory shortage', () => {
        it('no compensation needed, no side effects', () => {
            const svc = new OrderService();
            const r = svc.placeOrder('SKU-A', 999, 50, 'valid-card');

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('InventoryShortage');
                if (r.error.kind === 'InventoryShortage') {
                    expect(r.error.sku).toBe('SKU-A');
                }
            }

            expect(svc.inventoryState['SKU-A']).toBe(10);
            expect(svc.payments.length).toBe(0);
            expect(svc.orders.length).toBe(0);
        });
    });

    describe('failure at step 2: payment declined', () => {
        it('releases reserved inventory', () => {
            const svc = new OrderService();
            const r = svc.placeOrder('SKU-B', 2, 75, 'declined');

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('PaymentDeclined');
            }

            expect(svc.inventoryState['SKU-B']).toBe(5);
            expect(svc.payments.length).toBe(0);
            expect(svc.orders.length).toBe(0);
        });
    });

    describe('failure at step 3: order creation fails after payment', () => {
        it('releases inventory AND refunds payment (full rollback)', () => {
            const svc = new OrderService();
            const r = svc.placeOrder('broken', 1, 10, 'valid-card');

            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('OrderCreationFailed');
            }

            expect(svc.inventoryState['broken']).toBe(1);
            expect(svc.payments.length).toBe(2);
            expect(svc.payments[1]).toContain('REFUND');
            expect(svc.orders.length).toBe(0);
        });
    });

    describe('multiple concurrent orders', () => {
        it('each order is independent with its own compensation', () => {
            const svc = new OrderService();

            const r1 = svc.placeOrder('SKU-A', 2, 20, 'valid-card');
            expect(r1.isSuccess).toBe(true);

            const r2 = svc.placeOrder('SKU-B', 1, 30, 'declined');
            expect(r2.isFailure).toBe(true);

            expect(svc.inventoryState['SKU-A']).toBe(8);
            expect(svc.inventoryState['SKU-B']).toBe(5);
            expect(svc.payments.length).toBe(1);
            expect(svc.orders.length).toBe(1);
        });
    });

    describe('edge: zero-quantity order', () => {
        it('reserves zero inventory successfully', () => {
            const svc = new OrderService();
            const r = svc.placeOrder('SKU-A', 0, 5, 'valid-card');

            expect(r.isSuccess).toBe(true);
            expect(svc.inventoryState['SKU-A']).toBe(10);
        });
    });
});

describe('Async Result Patterns', () => {
    type AsyncError =
        | { kind: 'Timeout'; operation: string; ms: number }
        | { kind: 'NotFound'; id: string }
        | { kind: 'NetworkError'; url: string; status: number };

    type AsyncResult<T = void> = IResultOfT<T, AsyncError>;

    const AsyncResult = {
        Success<T = void>(value?: T): AsyncResult<T> {
            if (arguments.length === 0) return ok() as unknown as AsyncResult<T>;
            return ok(value!) as unknown as AsyncResult<T>;
        },
        Failure(error: AsyncError): AsyncResult<never> {
            return err(error) as unknown as AsyncResult<never>;
        },
    } as const;

    const Asyncok = AsyncResult.Success;
    const Asyncerr = AsyncResult.Failure;

    async function fetchUser(id: string): Promise<AsyncResult<{ id: string; name: string }>> {
        await delay(1);
        if (id === 'timeout') {
            return Asyncerr({ kind: 'Timeout', operation: 'fetchUser', ms: 5000 });
        }
        if (id === 'not-found') {
            return Asyncerr({ kind: 'NotFound', id });
        }
        return Asyncok({ id, name: `User-${id}` });
    }

    async function fetchOrders(
        userId: string,
    ): Promise<AsyncResult<Array<{ orderId: string; total: number }>>> {
        await delay(1);
        if (userId === 'no-orders') {
            return Asyncok([]);
        }
        if (userId === 'network-error') {
            return Asyncerr({ kind: 'NetworkError', url: '/api/orders', status: 502 });
        }
        return Asyncok([
            { orderId: 'O1', total: 42 },
            { orderId: 'O2', total: 99.99 },
        ]);
    }

    async function fetchAddress(
        userId: string,
    ): Promise<AsyncResult<{ city: string; country: string }>> {
        await delay(1);
        if (userId === 'no-address') {
            return Asyncerr({ kind: 'NotFound', id: `address:${userId}` });
        }
        return Asyncok({ city: 'Taipei', country: 'TW' });
    }

    function delay(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }

    describe('async function → Result', () => {
        it('success path returns Result with value', async () => {
            const r = await fetchUser('42');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.name).toBe('User-42');
            }
        });

        it('failure path returns Result with error', async () => {
            const r = await fetchUser('not-found');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('NotFound');
            }
        });
    });

    describe('async orchestration with early return', () => {
        async function getUserDashboard(
            userId: string,
        ): Promise<AsyncResult<{
            user: { id: string; name: string };
            orders: Array<{ orderId: string; total: number }>;
            address: { city: string; country: string };
        }>> {
            const userR = await fetchUser(userId);
            if (!userR.isSuccess) return userR as unknown as AsyncResult<{
                user: { id: string; name: string };
                orders: Array<{ orderId: string; total: number }>;
                address: { city: string; country: string };
            }>;

            const ordersR = await fetchOrders(userId);
            if (!ordersR.isSuccess) return ordersR as unknown as AsyncResult<{
                user: { id: string; name: string };
                orders: Array<{ orderId: string; total: number }>;
                address: { city: string; country: string };
            }>;

            const addressR = await fetchAddress(userId);
            if (!addressR.isSuccess) return addressR as unknown as AsyncResult<{
                user: { id: string; name: string };
                orders: Array<{ orderId: string; total: number }>;
                address: { city: string; country: string };
            }>;

            return Asyncok({
                user: userR.value,
                orders: ordersR.value,
                address: addressR.value,
            });
        }

        it('happy path: all async calls succeed', async () => {
            const r = await getUserDashboard('99');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.user.name).toBe('User-99');
                expect(r.value.orders).toHaveLength(2);
                expect(r.value.address.city).toBe('Taipei');
            }
        });

        it('short-circuits on first async failure (user not found)', async () => {
            const r = await getUserDashboard('not-found');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('NotFound');
            }
        });

        it('short-circuits on second async failure (order network error)', async () => {
            const r = await getUserDashboard('network-error');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('NetworkError');
            }
        });

        it('short-circuits on third async failure (address not found)', async () => {
            const r = await getUserDashboard('no-address');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('NotFound');
            }
        });
    });

    describe('Promise.all over async Results', () => {
        it('all succeed → collect all values', async () => {
            const [userR, ordersR, addressR] = await Promise.all([
                fetchUser('42'),
                fetchOrders('42'),
                fetchAddress('42'),
            ]);

            expect(userR.isSuccess).toBe(true);
            expect(ordersR.isSuccess).toBe(true);
            expect(addressR.isSuccess).toBe(true);

            if (userR.isSuccess && ordersR.isSuccess && addressR.isSuccess) {
                expect(userR.value.name).toBe('User-42');
                expect(ordersR.value).toHaveLength(2);
                expect(addressR.value.country).toBe('TW');
            }
        });

        it('one fails → partial results accessible', async () => {
            const [userR, ordersR, addressR] = await Promise.all([
                fetchUser('42'),
                fetchOrders('network-error'),
                fetchAddress('42'),
            ]);

            expect(userR.isSuccess).toBe(true);
            expect(ordersR.isFailure).toBe(true);
            expect(addressR.isSuccess).toBe(true);

            if (ordersR.isFailure) {
                expect(ordersR.error.kind).toBe('NetworkError');
            }
        });

        it('all fail → all errors accessible', async () => {
            const [userR, ordersR, addressR] = await Promise.all([
                fetchUser('not-found'),
                fetchOrders('network-error'),
                fetchAddress('no-address'),
            ]);

            expect(userR.isFailure).toBe(true);
            expect(ordersR.isFailure).toBe(true);
            expect(addressR.isFailure).toBe(true);
        });
    });

    describe('async error conversion across boundaries', () => {
        type SystemBError = { code: number; detail: string };
        type SystemAError = { kind: 'SubsystemFailed'; subsystem: string; message: string };

        async function callSubsystemB(): Promise<IResultOfT<string, SystemBError>> {
            await delay(1);
            return err<string, SystemBError>({ code: 503, detail: 'Service Unavailable' });
        }

        async function systemAOperation(): Promise<IResultOfT<string, SystemAError>> {
            const subR = await callSubsystemB();
            if (!subR.isSuccess) {
                return err<string, SystemAError>({
                    kind: 'SubsystemFailed',
                    subsystem: 'B',
                    message: `Code ${subR.error.code}: ${subR.error.detail}`,
                });
            }
            return ok(subR.value.toUpperCase()) as unknown as IResultOfT<string, SystemAError>;
        }

        it('converts error types across async boundaries', async () => {
            const r = await systemAOperation();
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('SubsystemFailed');
                expect(r.error.subsystem).toBe('B');
                expect(r.error.message).toContain('503');
            }
        });
    });

    describe('sequential async with data dependency', () => {
        async function checkoutFlow(
            cartId: string,
        ): Promise<AsyncResult<{ total: number; orderId: string }>> {
            if (cartId === 'empty') {
                return Asyncerr({ kind: 'NotFound', id: `cart:${cartId}` });
            }

            const total = cartId === 'vip' ? 50 : 100;

            await delay(1);

            return Asyncok({
                total,
                orderId: `ORD-${cartId.toUpperCase()}`,
            });
        }

        it('happy path: cart checkout succeeds', async () => {
            const r = await checkoutFlow('cart-abc');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.total).toBe(100);
                expect(r.value.orderId).toBe('ORD-CART-ABC');
            }
        });

        it('failure path: empty cart', async () => {
            const r = await checkoutFlow('empty');
            expect(r.isFailure).toBe(true);
            if (r.isFailure) {
                expect(r.error.kind).toBe('NotFound');
            }
        });

        it('vip customer gets discount', async () => {
            const r = await checkoutFlow('vip');
            expect(r.isSuccess).toBe(true);
            if (r.isSuccess) {
                expect(r.value.total).toBe(50);
            }
        });
    });
});


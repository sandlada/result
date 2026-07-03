import { Result } from './build/Result.js';
import { Option } from './build/Option.js';
import type { IResultSuccess } from './build/IResult.js';
import type { IResultOfTFailure, IResultOfTSuccess, IResultOfT } from './build/IResultOfT.js';

// ── 1. 基本工廠 ────────────────────────────────────────────────────────

/**
 * @fileoverview
 */
const ok = Result.Success(42) as IResultOfTSuccess<42>
const err = Result.Failure<number, string>('something went wrong') as IResultOfTFailure<number, string>
const empty = Result.Success() as IResultSuccess  // void success

console.log('ok:', ok.isSuccess, ok.value)
console.log('err:', err.isFailure, err.error)

// ── 2. Fluent chain ────────────────────────────────────────────────────

// The callback inside andThen must return a uniform error type.
// `Result.Success(x * 2)` defaults TError=Error, which conflicts with
// `Result.Failure<number, string>`. Cast the Success branch to match.
const chained = Result.Success(1)
    .map(x => x * 10)               // 1 → 10
    .andThen(x => x > 5
        ? Result.Success(x * 2) as unknown as IResultOfT<number, string>
        : Result.Failure<number, string>('too small'))
    .mapErr(e => `[wrapped] ${e}`)

console.log('chained:', chained.unwrapOr(-1))  // 20

// ── 3. tap / tapErr ────────────────────────────────────────────────────

Result.Success('hello')
    .tap(v => console.log('✓ got:', v))
    .tapErr(e => console.log('✗ err:', e))

// ── 4. Escape hatches ─────────────────────────────────────────────────

const ok2 = Result.Success(100)
console.log('expect:', ok2.expect('should not fail'))  // 100
console.log('unwrapOr:', ok2.unwrapOr(0))               // 100
console.log('unwrapOrElse:', ok2.unwrapOrElse(e => 0))  // 100

const err2 = Result.Failure<number, Error>(new Error('boom'))
console.log('getOrNull:', err2.getOrNull())       // null
console.log('getOrUndefined:', err2.getOrUndefined()) // undefined
console.log('mapOr:', err2.mapOr(-1, x => x * 2)) // -1

// ── 5. match (終端操作) ─────────────────────────────────────────────────

const description = ok2.match(
    v => `success: ${v}`,
    e => `failure: ${e.message}`,
)
console.log(description) // "success: 100"

// ── 6. combine / all ───────────────────────────────────────────────────

const r1 = Result.Success(10)
const r2 = Result.Success(20)
const r3 = Result.Success(30)

const combined = Result.combine([r1, r2, r3])
console.log('combined:', combined.unwrapOr([]))  // [10, 20, 30]

// ── 7. fromOption / toOption ───────────────────────────────────────────

const some = Option.Some(42)
const none = Option.None()

const fromSome = Result.fromOption(some, new Error('was none'))
console.log('fromOption Some:', fromSome.unwrapOr(0)) // 42

const fromNone = Result.fromOption(none, new Error('was none'))
console.log('fromOption None:', fromNone.isFailure)    // true

// ── 8. fromPredicate ───────────────────────────────────────────────────

const positive = Result.fromPredicate(5, n => n > 0, 'must be positive')
console.log('fromPredicate ok:', positive.isSuccess)  // true

const negative = Result.fromPredicate(-3, n => n > 0, 'must be positive')
console.log('fromPredicate fail:', negative.isFailure) // true

// ── 9. fromThrowable ───────────────────────────────────────────────────

const safeParse = Result.fromThrowable(JSON.parse)
const safe = safeParse('{"a":1}')
console.log('fromThrowable ok:', safe.unwrapOr(null))  // { a: 1 }

const failParse = Result.fromThrowable(
    JSON.parse,
    (e: unknown) => new Error(`Parse error: ${String(e)}`),
)
const fail = failParse('not json')
console.log('fromThrowable fail:', fail.isFailure)     // true

// ── 10. Railway pipeline ───────────────────────────────────────────────

function validateName(name: string): IResultOfT<string, string> {
    return name.length > 0
        ? Result.Success(name) as unknown as IResultOfT<string, string>
        : Result.Failure<string, string>('name is required')
}
function validateAge(age: number): IResultOfT<number, string> {
    return age >= 18
        ? Result.Success(age) as unknown as IResultOfT<number, string>
        : Result.Failure<number, string>('must be 18+')
}

const person = validateName('Alice')
    .andThen(name =>
        validateAge(25)
            .map(age => ({ name, age }))
    )

person.match(
    p => console.log('✓ person:', p),
    e => console.log('✗ error:', e),
)

// ── 11. toString / toJSON ──────────────────────────────────────────────

console.log(Result.Success(1).toString())            // "Ok(1)"
console.log(Result.Failure('oops').toString())       // "Err(oops)"
console.log(JSON.stringify(Result.Success(1)))       // {"isSuccess":true,"value":1}
console.log(JSON.stringify(Result.Failure('oops')))  // {"isSuccess":false,"error":"oops"}



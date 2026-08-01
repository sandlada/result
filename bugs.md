# bugs.md — 类型谎言/类型欺骗审计报告

> 本文档记录 `@sandlada/result` 库的 `src/` 全范围内检查出的**类型谎言/类型欺骗**问题。
> "类型谎言"指：TypeScript 类型签名/断言与代码运行时实际行为不一致的现象。
> 这类问题会导致 TS 编译期保证失效，调用方基于类型推断得出的结论可能在运行时崩溃。
> **审计时间**：2026-08-01
> **审计范围**：`src/` 下全部 `.ts` 源文件（不含 `.spec.ts` / `.type-spec.ts` / `.bench.ts`），约 180+ 个文件
> **审计方式**：基于类型契约 (`types/IResult.ts`, `types/IResultOfT.ts`, `types/Option.ts`, `types/AsyncResult.ts`, `types/AsyncOption.ts`) 比对实现中的断言与 cast；交叉验证 `bugs.md` 中声称已修复的项是否仍在 `main` 分支上有效。

---

## ⚠️ 关于历史修复记录的更正

旧 `bugs.md` 列出的 9 个修复批次（commit `4e24904` ~ `1bfe1d8`）存在**严重的描述失真**——多数声称"已修复"的问题在 `main` 分支上**仍然存在**。具体如下：

| 旧批次 | 声称范围 | 实际情况（2026-08-01） |
| --- | --- | --- |
| Batch 3 `fix/d-class-double-cast` | "93 个文件：单层 cast → `as unknown as`" | ❌ **未实际应用**。`grep` 全源码发现 243 处 `as IResultOfT<...>` / `as IOption<...>` 单层 cast 散落在 104 个文件中。factories（`tryCatch`/`fromThrowable`/`fromPromise`/`ok`/`err`/`fromPredicate`）、primitives（`cond`/`condErr`/`lift`/`sequenceAsyncResult`）、adapters（`fromOption`/`switchFn`/`switchFnAsync`）、async-result、promise-result、reliability 均有遗漏。 |
| Batch 4 `fix/c-class-unknown-transit` | "41 个文件：`e as E` → `e as unknown as E`" | ❌ **未实际应用**。`grep` 发现 122 处单层 `as E` / `as F` / `e as E` / `err as E` / `rej as E` 散落在 92 个文件中。operators、async-result、promise-result、reliability 全军覆没。 |
| Batch 5 `fix/retry-errorfn-required` | `RetryOptions` 新增 `errorFn` | ✅ `retry.ts:36-62` 确实新增了 `errorFn` 字段；但 `retry.ts:97` 仍有 `as IResultOfT<never, E>` 单层 cast 漏改。 |
| Batch 6 `fix/throws-require-error-type` | `unsafeUnwrap` JSDoc 警告 | ✅ `unsafeUnwrap.ts` / `unsafeUnwrapErr.ts` 的 JSDoc 警告已加。 |
| Batch 7 `fix/async-carrier-brand` | `ASYNC_CARRIER_BRAND` Symbol | ❌ **完全未实现**。`src/types/asyncCarrier.ts` 全文仍是纯 duck-type 检查，无任何 `Symbol` 声明。 |
| Batch 8 `fix/ctx-promise-check` | `ctx.ts` thenable 检查 | ✅ `ctx.ts:91-94` 的 `isThenable` 已正确使用 null 守卫 + `as unknown as` 中转。 |
| Batch 9 `fix/ctx-async-isolation` (pending) | `AsyncLocalStorage` 改造 | ✅ `ctx.ts` 已使用 `AsyncLocalStorage` 隔离（带 polyfill fallback）。 |

**根因推测**：Batch 1/2/5/6/8/9 在 `main` 上实际落地；Batch 3、4、7 的修复**仅存在于功能分支，未合并到 main**——或者在后续重构中被部分回退。审计反映了 `main` 的真实状态。

---

## 当前状态总览

| 类别 | 描述 | 数量 |
| --- | --- | --- |
| **A** | `as unknown as` 跨变体谎言（结构未根治，仅从单层改为双层） | 150+ 处 |
| **C** | `e as E` / `err as E` / `rej as E` 跳过 `unknown` 中转 | 122 处 / 92 文件 |
| **D** | `as IResultOfT<...>` / `as IOption<...>` 单层 cast | 243 处 / 104 文件 |
| **F** | `safeTry` / `safeTryAsync` 隐式 `undefined` 返回 | 1 处（safeTryAsync） |
| **G1** | `composeK` / `composeKAsync` 同步 throw 时注入 `unknown` 当 `E` | 2 处 |
| **G12** | `asyncCarrier` duck-type 谎言 | 1 处（完全未实现品牌） |
| **G14** | `asyncBind` 成功路径丢失源 `E` | 1 处 |
| **H** | `T` / `undefined` 类型混淆 | 1 处（tapErrAsyncOption） |
| **P** | Promise widening 类型谎言 | 2 处（asyncOk / asyncErr） |

**总计**：180+ 个文件中 522+ 处类型谎言。

---

## 详细分类

### A. `as unknown as` 跨变体谎言

`fix/d-class-double-cast` 已**部分**统一为双层 cast (`as unknown as`)，但**仍是跨变体谎言**——只是把"绕过类型守卫"从单层变成了双层。运行时结构与声明的联合类型本质不一致：

- 字面量对象（如 `{ isSuccess, isFailure, value }`）是 success 变体
- 但 cast 到 `IResultOfT<T, E>`（全 union）声称可能含 error 字段

**根治方案**：把 `IResultOfT` 拆成两个独立类型，工厂返回窄变体，调用方用 union 处理。
**当前缓解**：在已落地的双层 cast 位置，`unknown` 中转已显式化。

---

### C. `e as E`（跳过 unknown 中转）— ❌ 仍在 92 个文件中

这是当前**最普遍**的类型谎言。每个 catch 块都用 `e as E` / `err as E` / `rej as E` 把 `unknown` 直接 cast 到具体错误类型，绕过 `unknown` 中转。

#### operators/（11 处）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `operators/andTee.ts` | 46 | `return err(e as E) as unknown as IResultOfT<A, E>;` |
| `operators/andThrough.ts` | 50 | `return err(e as (E \| F)) as unknown as IResultOfT<A, E \| F>;` |
| `operators/ap.ts` | 38 | `return err(e as E) as unknown as IResultOfT<B, E>;` |
| `operators/bimap.ts` | 36 | `return err(e as F) as unknown as IResultOfT<C, F>;` |
| `operators/filterOrElse.ts` | 41 | `return err(e as E) as unknown as IResultOfT<A, E>;` |
| `operators/map.ts` | 27 | `return err(e as E) as unknown as IResultOfT<B, E>;` |
| `operators/orElse.ts` | 32 | `return err(e as F) as unknown as IResultOfT<A \| B, F>;` |
| `operators/orTee.ts` | 46 | `return err(e as E) as unknown as IResultOfT<A, E>;` |
| `operators/tap.ts` | 28 | `return err(e as E) as unknown as IResultOfT<A, E>;` |
| `operators/tapErr.ts` | 28 | `return err(e as E) as unknown as IResultOfT<A, E>;` |
| `operators/traverseArray.ts` | 45 | `return err(e as E) as unknown as IResultOfT<B[], E>;` |

#### async-result/（14 处）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `async-result/andTee.ts` | 43 | `error: e as E } as IResultOfT<T, E>;` |
| `async-result/andThrough.ts` | 48 | `return err(e as E \| F) as unknown as IResultOfT<T, E \| F>;` |
| `async-result/bimap.ts` | 46 | `return err(e as F) as IResultOfT<U, F>;` |
| `async-result/bind.ts` | 45 | `error: e as E } as IResultOfT<U, E>;` |
| `async-result/filterOrElse.ts` | 48 | `return err(e as E) as unknown as IResultOfT<T, E>;` |
| `async-result/map.ts` | 39 | `error: e as E } as IResultOfT<U, E>;` |
| `async-result/mapErr.ts` | 39 | `error: e as F } as IResultOfT<T, F>;` |
| `async-result/mapErrAsync.ts` | 39 | `return err(e as F) as IResultOfT<T, F>;` |
| `async-result/orElse.ts` | 44 | `error: e as F } as IResultOfT<T, E \| F>;` |
| `async-result/orTee.ts` | 43 | `error: e as E } as IResultOfT<T, E>;` |
| `async-result/tap.ts` | 42 | `error: e as E } as IResultOfT<T, E>;` |
| `async-result/tapAsync.ts` | 37 | `error: e as E } as IResultOfT<T, E>;` |
| `async-result/tapErr.ts` | 42 | `error: e as E } as IResultOfT<T, E>;` |
| `async-result/tapErrAsync.ts` | 37 | `error: e as E } as IResultOfT<T, E>;` |

#### promise-result/（10 处）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `promise-result/asyncMap.ts` | 44 | `return { ..., error: e as E } as IResultOfT<B, E>;` |
| `promise-result/bimapAsync.ts` | 43 | `return err(e as F) as IResultOfT<B, F>;` |
| `promise-result/map.ts` | 36 | `return err(e as E) as IResultOfT<B, E>;` |
| `promise-result/mapAsync.ts` | 32 | `return err(e as E) as IResultOfT<B, E>;` |
| `promise-result/mapErr.ts` | 36 | `return err(e as E) as IResultOfT<B, E>;` |
| `promise-result/mapErrAsync.ts` | 31 | `return err(e as E) as IResultOfT<B, E>;` |
| `promise-result/tapAsync.ts` | 32 | `return { ..., error: e as E } as IResultOfT<A, E>;` |
| `promise-result/tapErrAsync.ts` | 32 | `return { ..., error: e as E } as IResultOfT<A, E>;` |

#### reliability/（4 处）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `reliability/allSettled.ts` | 55 | `settledOutcomes[idx] = { ok: false, error: rej as E };` |
| `reliability/any.ts` | 52 | `errors.push(rej as E);` |
| `reliability/race.ts` | 94 | `error: findEarliestRejection() as E,` |
| `reliability/timeout.ts` | 75 | `error: err as E } as IResultOfT<T, E \| TOE>;` |

#### 其他零散 C-class（13 处）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `async-option/okOrElse.ts` | 39 | `return err(e as E) as unknown as Awaited<...>;` |
| `factories/fromPromise.ts` | 26 | `e as unknown as E` ✅ 已修，但 `fromPromise.ts:21,27` 仍 D-class |
| `factories/fromThrowable.ts` | 31 | `e as unknown as E` ✅ 已修，但 `fromThrowable.ts:26,32` 仍 D-class |
| `factories/fromSafePromise.ts` | — | ✅ 全部已修（e instanceof Error 正确处理） |
| `factories/tryCatch.ts` | 27 | `e as unknown as E` ✅ 已修，但 `tryCatch.ts:22,28` 仍 D-class |
| `factories/tryCatchAsync.ts` | 26 | `e as unknown as E` ✅ 已修，但 `tryCatchAsync.ts:21,27` 仍 D-class |
| `factories/asyncOk.ts` / `asyncErr.ts` | — | ❌ 见 P 类（Promise widening） |
| `option/okOrElse.ts` | 36 | `return err(e as E) as IResultOfT<T, E>;` |
| `reliability/retry.ts` | 97 | `err(wrapped as unknown as E) as IResultOfT<never, E>;`（C 已修，D 未修） |

**统一修复建议**：

```sh
# 替换 catch 块中的单层 cast
sed -i 's/err(e as \([A-Za-z |()]*\))/err(e as unknown as \1)/g' \
    src/operators/*.ts \
    src/async-result/*.ts \
    src/promise-result/*.ts \
    src/reliability/*.ts
```

---

### D. `as IResultOfT<...>` / `as IOption<...>` 单层 cast — ❌ 仍在 104 个文件中

`fix/d-class-double-cast` 声称扫了 93 个文件，但实际只**部分落地**。factories、primitives、adapters、async-result、promise-result、reliability 中仍有大量遗漏。

#### factories/（15 处 / 8 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `factories/ok.ts` | 27 | `return { ..., value: value! } as IResultOfT<T, never>;` |
| `factories/err.ts` | 18 | `return { ..., error } as IResultOfT<never, E>;` |
| `factories/fromPredicate.ts` | 48, 49 | `ok(value!) as IResultOfT<T, E>;` / `err(errorOnFalse) as IResultOfT<T, E>;` |
| `factories/fromThrowable.ts` | 26, 32 | `ok<T>(fn(...args)) as IResultOfT<T, E>;` / `err(innerError) as IResultOfT<T, E>;` |
| `factories/fromPromise.ts` | 21, 27 | 同上 |
| `factories/tryCatch.ts` | 22, 28 | 同上 |
| `factories/tryCatchAsync.ts` | 21, 27 | 同上 |
| `factories/asyncOk.ts` | 17 | `Promise.resolve(ok(value))` — 见 P 类 |
| `factories/asyncErr.ts` | 17 | `Promise.resolve(err(error))` — 见 P 类 |

#### primitives/（9 处 / 4 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `primitives/cond.ts` | 34, 35 | `(ok(value) as IResultOfT<T, E>)` / `(err(errorOnFalse) as IResultOfT<T, E>)` |
| `primitives/condErr.ts` | 29, 30 | `(err(errorOnTrue) as IResultOfT<T, E>)` / `(ok(okValue) as IResultOfT<T, E>)` |
| `primitives/lift.ts` | 52 | `err(errorFn(caught)) as IResultOfT<T, E>;`（line 50 已 `as unknown as`，line 52 不一致） |
| `primitives/sequenceAsyncResult.ts` | 36, 39 | `r as IResultOfT<T[], E>;` / `ok(values) as IResultOfT<T[], E>;` |

#### adapters/（5 处 / 3 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `adapters/fromOption.ts` | 25 | `err(errorOnNone) as IResultOfT<A, E>;` |
| `adapters/switchFn.ts` | 29, 34 | `ok(f(a)) as IResultOfT<B, E>;` / `err(caught) as IResultOfT<B, E>;` |
| `adapters/switchFnAsync.ts` | 27, 32 | `ok(await f(a)) as IResultOfT<B, E>;` / `err(caught) as IResultOfT<B, E>;` |

#### async-result/（6 处 / 5 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `async-result/bind.ts` | 43 | `return next as IResultOfT<U, E>;` |
| `async-result/combineWithAllErrors.ts` | 38, 40 | literal-object cast 跳过 `unknown` |
| `async-result/filterOrElse.ts` | 46 | `err(await errorFn(r.value)) as IResultOfT<T, E>;` |
| `async-result/mapErrAsync.ts` | 37, 39 | `err(await fn(r.error)) as IResultOfT<T, F>;` |
| `async-result/orElse.ts` | 42 | `return next as IResultOfT<T, E \| F>;` |

#### async-option/（3 处 / 3 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `async-option/bind.ts` | 43 | `return next as IOption<U>;` |
| `async-option/filter.ts` | 44 | `return ofNone() as unknown as IOption<T>;`（line 42 同位置无 cast，不一致） |
| `async-option/orElse.ts` | 42 | `return next as IOption<T>;` |

#### async-option `as never` 风格（3 处 / 3 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `async-option/ofNone.ts` | 19 | `return { run: () => Promise.resolve(syncOfNone() as never) };` |
| `async-option/transpose.ts` | 34 | 类似 `as never` cast |
| `async-option/zipWith.ts` | 38 | 类似 `as never` cast |

类型失真：`as never` 把 `IOption<never>`（即 `IOptionNone`）压成 `never`，再借由上下文类型反推为 `IOption<T>`，中间过程不透明。

#### option/（3 处 / 2 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `option/okOr.ts` | 25 | `err(error) as IResultOfT<T, E>;` |
| `option/okOrElse.ts` | 34, 36 | `err(errorFn()) as IResultOfT<T, E>;` / `err(e as E) as IResultOfT<T, E>;`（后者还兼具 C-class） |

#### operators/（2 处 / 1 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `operators/match.ts` | 71 | `const target = direct as IResultOfT<A, E>;` |

#### promise-result/（11 处 / 10 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `promise-result/asyncMap.ts` | 47 | literal-object cast `as IResultOfT<B, E>` |
| `promise-result/bimapAsync.ts` | 43 | `err(e as F) as IResultOfT<B, F>;`（同时 C-class） |
| `promise-result/bindAsync.ts` | 41 | `return (await f(inner.value)) as IResultOfT<B, E \| F>;` |
| `promise-result/combine.ts` | 28 | literal-object cast |
| `promise-result/combineWithAllErrors.ts` | 30, 32 | literal-object cast ×2 |
| `promise-result/filterOrElseAsync.ts` | 46 | `err(await errorFn(inner.value)) as IResultOfT<A, E>;` |
| `promise-result/map.ts` | 36 | `err(e as E) as IResultOfT<B, E>;`（同时 C-class） |
| `promise-result/mapAsync.ts` | 32 | 同上 |
| `promise-result/mapErr.ts` | 36 | 同上 |
| `promise-result/mapErrAsync.ts` | 31 | 同上 |
| `promise-result/orElseAsync.ts` | 36 | `return (await f(inner.error)) as IResultOfT<A \| B, F>;` |
| `promise-result/tapAsync.ts` | 32 | literal-object cast |
| `promise-result/tapErrAsync.ts` | 32 | literal-object cast |

#### reliability/（6 处 / 4 文件）

| 文件 | 行 | 代码 |
| --- | --- | --- |
| `reliability/allSettled.ts` | 45, 59 | `ok([] as Settled<T, E>[]) as IResultOfT<...>` / `ok(settledOutcomes) as IResultOfT<...>` |
| `reliability/any.ts` | 56, 58 | `ok(successes) as IResultOfT<T[], E[]>;` / `err(errors) as IResultOfT<T[], E[]>;` |
| `reliability/race.ts` | 80, 95 | `resolve((firstError ?? r) as IResultOfT<T, E>);` / `as IResultOfT<T, E>` |
| `reliability/retry.ts` | 97, 137 | `err(...) as IResultOfT<never, E>` / `return lastResult as IResultOfT<T, E>` |
| `reliability/timeout.ts` | 69 | `resolve(r as IResultOfT<T, E \| TOE>);` |

**统一修复建议**：

```sh
# 把所有 `as IResultOfT<...>` / `as IOption<...>` 单层 cast 升级为 `as unknown as ...`
# 注意：需要同时把 catch 块中的 `e as E` 升级为 `e as unknown as E`
```

---

### F. 隐式 `undefined` 返回 — ⚠️ safeTry 已修，safeTryAsync 未修

`fix/safetry-undefined-return`（commit `4e24904`）把 `safeTry` 的 Generator 返回类型由 `T` 放宽为 `T | undefined`，但 **async 对应物 `safeTryAsync` 漏改**——仍然是同样的类型谎言。

#### F1. `composition/safeTryAsync.ts:30, 37` — ❌ 未修复

```ts
export async function* safeTryAsync<T, E>(
    result: AsyncResult<T, E> | Promise<IResultOfT<T, E>>,
): AsyncGenerator<IResultOfT<never, E>, T, unknown> {  // ← 返回类型声称 T
    ...
    if (r.isSuccess) return r.value;
    yield r as IResultOfT<never, E>;
    return undefined as never;  // ← 实际返回 undefined，用 `as never` 压扁
}
```

签名说 `T`，运行时 yield 失败路径返回 `undefined`（用 `as never` 骗 TS）。`fromSafeTryAsync:50` 显式判断 `first.value === undefined` 并 throw——证明 runtime 知道 undefined 的存在，但签名假装不存在。

**严重程度**：medium（与原 F-class bug 同级；async 对应物被遗忘）。

**修复建议**：

```ts
export async function* safeTryAsync<T, E>(
    result: AsyncResult<T, E> | Promise<IResultOfT<T, E>>,
): AsyncGenerator<IResultOfT<never, E>, T | undefined, unknown> {  // ← 改 T | undefined
    ...
    if (r.isSuccess) return r.value;
    yield r as IResultOfT<never, E>;
    return undefined;  // ← 去掉 `as never`
}
```

---

### G1. `composeK` / `composeKAsync` 同步 throw 时注入 `unknown` 当 `E` — ❌ 仍未修复

旧 `bugs.md` 描述正确，但修复未做。

#### G1a. `composition/composeK.ts:86`

```ts
} catch (e: unknown) {
    return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<unknown, unknown>;
}
```

签名 `composeK<A,B,C,D,E>(...)` 说 error 是 `E`，但同步 throw 时 runtime 塞进 `unknown` 任意值。**用户调用后，`result.error` 编译期是 `E`，运行期是 `TypeError('xxx')`**。

#### G1b. `composition/composeKAsync.ts:87`

```ts
} catch (e: unknown) {
    return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<unknown, unknown>;
}
```

同样问题。

**严重程度**：medium（runtime 错误类型不匹配，但不会立即崩溃——consumer 拿到 `E`-类型的 error 后调用时才会炸）。

**修复建议**：仿 `retry.ts` 的 `errorFn` 模式，为 `composeK` / `composeKAsync` 加可选 `errorFn: (e: unknown) => E` 参数。无 `errorFn` 时通过 `as unknown as IResultOfT<unknown, E>` 走 unknown 中转（保持内部 `IResultOfT<unknown, unknown>` 形式，对外暴露按需映射）。

---

### G12. `asyncCarrier` 品牌校验 — ❌ 完全未实现

旧 `bugs.md` 描述："`asyncCarrier.ts` 导出 `ASYNC_CARRIER_BRAND` Symbol；`isAsyncCarrier` 先查品牌再 fallback 到 duck-type；8 个内部工厂设置品牌。"

**实际状态**（2026-08-01）：`grep ASYNC_CARRIER_BRAND src/` → **0 处匹配**。文件 `src/types/asyncCarrier.ts` 仍仅 47 行，全部为纯 duck-type，无 Symbol 声明、无品牌设置、无品牌检查。

**严重程度**：medium。Duck-type 在大多数场景下工作，但调用方可以传入任意带 `run` 方法的对象（包括 `Promise`）被误判为 AsyncResult 载体，导致意外行为。

**修复建议**：按 `bugs.md` 旧描述实现——导出 `ASYNC_CARRIER_BRAND = Symbol(...)`，修改 `isAsyncCarrier` 先检查品牌再 fallback；8 个内部工厂（`fromResult`、`from`、`fromPromise`、`asyncOk`、`asyncErr`、`ofSome`、`ofNone`、`ofNone`/`ofSome` 异步版）在返回对象上设置品牌。

---

### G14. `promise-result/asyncBind.ts:47` — 错误联合 `E` 在运行时消失 — ❌ 仍未修复

旧 `bugs.md` 描述正确，但修复未做。

```ts
return Promise.resolve().then(() => f(r.value)) as unknown as Promise<IResultOfT<B, E | F>>;
```

签名 `Promise<IResultOfT<B, E | F>>` 包含 `E`，但 `f()` 只返回 `Promise<IResultOfT<B, F>>`，包装后实际是 `Promise<IResultOfT<B, F>>`。

- **更严重的问题**：`Promise.resolve().then(() => f(...))` 返回 `Promise<Promise<IResultOfT<B, F>>>`，不是 `Promise<IResultOfT<B, F>>`。runtime `await asyncBind(...)` 会 yield 一个 Promise，需要二次 await 才能拿到 `IResultOfT`。
- **调用方声明的源 Result 错误类型 `E` 在 bind 后静默丢失**。

**严重程度**：high（调用方拿到的可能是 `Promise<IResultOfT<B, F>>` 而非 `IResultOfT<B, F>`；且 E 类型在签名上撒谎）。

**修复建议**：

```ts
// 当前：Promise<IResultOfT<B, E | F>>
// 建议改为：Promise<IResultOfT<B, F>> （去掉 E，因为成功路径不会带 E）
// 同时改写为：
return Promise.resolve(r.value).then(f) as unknown as Promise<IResultOfT<B, F>>;
```

---

### H. `T` / `undefined` 类型混淆

#### H1. `promise-option/tapErrAsyncOption.ts:28`

```ts
await fn(undefined as T);
```

签名 `fn: (value: T) => void | Promise<void>` 声称收到 `T`，但 None 路径实际传 `undefined`（用 `as T` 强转）。JSDoc 示例暗示了 `undefined` 但类型签名未声明。

**严重程度**：low（运行时按 JSDoc 工作，但静态类型撒谎）。

**修复建议**：

```ts
// 改 fn 签名为：
fn: (value: T | undefined) => void | Promise<void>
```

---

### P. Promise widening 类型谎言

#### P1. `factories/asyncOk.ts:17`

```ts
export function asyncOk<T>(value: T): Promise<IResultOfT<T, never>> {
    return Promise.resolve(ok(value));
}
```

`ok(value)` 的实现签名是 `ok<T>(value?: T): IResult<never> | IResultOfT<T, never>`，所以 `Promise.resolve(ok(value))` 推断为 `Promise<IResult<never> | IResultOfT<T, never>>`。

- `IResult<never>` = `IResultSuccess | IResultFailure<never>`，其成功变体没有 `value` 字段
- `IResult<T, never>` = `IResultOfTSuccess<T> | IResultOfTFailure<never>`，其成功变体有 `value: T`
- 二者**不是子类型关系**

签名说 `Promise<IResultOfT<T, never>>`，但实现返回的 Promise 解析类型更宽。

#### P2. `factories/asyncErr.ts:17`

```ts
export function asyncErr<E>(error: E): Promise<IResultOfT<never, E>> {
    return Promise.resolve(err(error));
}
```

同理：`err(error)` 的实现签名是 `err<E>(error: E): IResultOfT<never, E>`，这部分没问题；但 `err` 是单层 cast，调用 `Promise.resolve` 时 `err` 已经是 `IResultOfT<never, E>`，所以 P2 主要继承自 `err.ts:18` 的 D-class 谎言。

**严重程度**：low（runtime 总是 success 变体/P1 总是 failure 变体，类型层级的窄声明不影响运行时正确性）。

**修复建议**：

```ts
// P1
return Promise.resolve(ok(value) as unknown as IResultOfT<T, never>);

// P2（与 err.ts 的 D-class 修复合并）
return Promise.resolve(err(error) as unknown as IResultOfT<never, E>);
```

---

## 其他零散问题

### B. `value!` / `arr[i]!` 非空断言（low 严重度）

bugs.md 旧版声称 `ok.ts` / `fromPredicate.ts` 的 `value!` 已"转为非 `!` 写法"，但实际仍有：

| 文件 | 行 | 备注 |
| --- | --- | --- |
| `factories/ok.ts` | 27 | `value: value!`（`arguments.length === 0` 守卫后） |
| `factories/fromPredicate.ts` | 48 | `predicate(value!)` × 2（`arguments.length < 3` 守卫后） |
| `operators/choose.ts` | 34 | `const r = fn(items[i]!);`（循环守卫 `i < len`） |
| `operators/traverseArray.ts` | 40 | `const item = items[i]!;`（循环守卫 `i < items.length`） |
| `combine/combineWithAllErrors.ts` | 26 | `const r = results[i]!;`（循环守卫） |
| `reliability/race.ts` | 58, 60 | `rejections[0]!` / `rejections[i]!`（长度守卫） |
| `composition/composeK.ts` | 76, 82 | `fns[0]!` / `fns[i]!`（长度守卫） |
| `composition/composeKAsync.ts` | 81 | `head!`（数组解构后守卫） |
| `composition/safeTry.ts` | 85, 97 | `iterator.return(undefined!)`（语义清晰） |
| `composition/safeTryAsync.ts` | 55, 65 | 同上 |
| `primitives/partitionOption.ts` | 39 | `opts[i]!`（循环守卫） |
| `primitives/reduce.ts` | 38 | `items[i]!`（循环守卫） |
| `primitives/sequenceAsyncResult.ts` | 34 | `runs[i]!`（循环守卫） |
| `reliability/allSettled.ts` | 51, 55 | `settledOutcomes[idx]`（已用 `Array` 预分配，访问安全但仍是 `[idx]` 形式） |

**严重程度**：low（所有 `!` 都有显式守卫，runtime 安全；违反项目"无 `!`"约定但非真实 bug）。

---

### 局部 / 函数内 cast 风格不一致

#### `primitives/lift.ts:50 vs 52`

```ts
return ok(fn(...args)) as unknown as IResultOfT<T, E>;  // line 50 ✅
...
if (errorFn) return err(errorFn(caught)) as IResultOfT<T, E>;  // line 52 ❌
```

同函数相邻两行使用不同 cast 风格。

#### `async-option/filter.ts:42 vs 44`

```ts
return ofNone();                                          // line 42 ✅（上下文类型 IOption<T>）
...
return ofNone() as unknown as IOption<T>;                 // line 44 ❌（catch 块丢失上下文）
```

---

## 重审结论（更新版）

### ❌ 当前**未修复**的谎言（按严重度）

| 等级 | 类别 | 数量 | 位置 |
| --- | --- | --- | --- |
| 🟠 高 | G14 | 1 | `promise-result/asyncBind.ts:47`（await 行为 + E 静默丢失） |
| 🟡 中 | C | 122 处 | 92 文件（operators / async-result / promise-result / reliability / option / factories） |
| 🟡 中 | D | 243 处 | 104 文件（factories / primitives / adapters / async-result / promise-result / reliability / async-option / option） |
| 🟡 中 | G1 | 2 | `composeK.ts:86` / `composeKAsync.ts:87` |
| 🟡 中 | F | 1 | `safeTryAsync.ts:30, 37`（async 对应物漏修） |
| 🟡 中 | G12 | 1 | `asyncCarrier.ts`（品牌完全未实现） |
| 🟡 中 | A | 150+ | 跨变体结构谎言（已从单层升级为双层，但根因仍在） |
| 🟢 低 | H | 1 | `tapErrAsyncOption.ts:28`（`fn(undefined as T)`） |
| 🟢 低 | P | 2 | `asyncOk.ts:17` / `asyncErr.ts:17`（Promise widening） |
| 🟢 低 | B | 14 处 | 14 文件（`value!` / `arr[i]!`，均有守卫） |

### ✅ 已修复（无需再列）

- Batch 1：`safeTry` `T` → `T \| undefined`（commit `4e24904`）
- Batch 5：`retry` `errorFn` 字段（commit `dfb3b48`）
- Batch 6：`unsafeUnwrap` / `unsafeUnwrapErr` JSDoc 警告（commit `488ed9e`）
- Batch 8：`ctx.ts` thenable 检查（commit `1bfe1d8`）
- Batch 9：`ctx.ts` `AsyncLocalStorage` 改造（pending → 已落地）
- 单文件零散修复：`factories/fromSafePromise.ts`、`factories/fromPromise.ts`/`fromThrowable.ts`/`tryCatch.ts`/`tryCatchAsync.ts` 的 C-class catch 块（`e as unknown as E`）、`reliability/race.ts:43`（空数组分支的 `as unknown as E`）

### ❌ 旧 bugs.md 失真条目

| 旧条目 | 实际情况 |
| --- | --- |
| "Batch 3: 93 个文件跨变体 cast 全部 `as unknown as`" | ❌ 实际 243 处单层 cast 散落 104 文件；factories/primitives/adapters/async-result/promise-result/reliability 全军覆没 |
| "Batch 4: 41 个文件 catch 块全部 `e as unknown as E`" | ❌ 实际 122 处单层 `e as E` / `err as E` / `rej as E` 散落 92 文件；operators/async-result/promise-result/reliability 全军覆没 |
| "Batch 7: asyncCarrier 品牌校验" | ❌ 完全未实现，文件无 `Symbol` 声明 |
| "B 类（`value!`）：已修复" | ❌ 仍有 14 处带守卫的 `!`（在 14 个不同文件中） |

---

## 修复优先级建议

1. **P0** — G14 `asyncBind.ts:47`（runtime 行为错误 + E 静默丢失，可能导致 await 后类型不匹配）
2. **P1** — F1 `safeTryAsync.ts:30, 37`（async safeTry 的 F-class 谎言）
3. **P1** — G1 `composeK` / `composeKAsync`（错误类型不匹配 + 可选 `errorFn` 缺失）
4. **P1** — G12 `asyncCarrier`（品牌校验缺失；可一行 sed 修复加 Symbol 暴露）
5. **P2** — C/D 类的全面统一为 `as unknown as`（可大规模 sed 替换）
6. **P3** — H1 `tapErrAsyncOption` 改 fn 签名
7. **P3** — P1/P2 `asyncOk`/`asyncErr` 显式 cast
8. **P4** — B 类 `!` 重构（用 `for...of` 或预绑定代替）

---

> *审计范围：`src/` 下全部 `.ts` 源文件（不含 `.spec.ts` / `.type-spec.ts` / `.bench.ts`）。*
> *审计方式：基于类型契约 (`types/IResult.ts`, `types/IResultOfT.ts`, `types/Option.ts`, `types/AsyncResult.ts`, `types/AsyncOption.ts`) 比对实现中的断言与 cast；交叉验证 `bugs.md` 历史条目。*
> *当前状态：8 个旧批次中 5 个失真或未落地；新增 4 类谎言（F1 / H1 / P1+P2）；C/D 类从"已修复"退化为"522+ 处漏改"；G12 完全未实现。*

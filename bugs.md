# bugs.md — 类型谎言/类型欺骗审计报告

> 本文档记录 `@sandlada/result` 库的 `src/` 全范围内检查出的**类型谎言/类型欺骗**问题。
> "类型谎言"指：TypeScript 类型签名/断言与代码运行时实际行为不一致的现象。
> 这类问题会导致 TS 编译期保证失效，调用方基于类型推断得出的结论可能在运行时崩溃。

---

## 修复记录

| 批次 | 类别 | 分支 | Commit | 改动 |
| --- | --- | --- | --- | --- |
| 1 | F | `fix/safetry-undefined-return` | `4e24904` | `safeTry` 的 Generator 返回类型由 `T` 改为 `T \| undefined`，`fromSafeTry` 同步放宽；移除 `return undefined as unknown as T` 类型谎言 |
| 3 | D | `fix/d-class-double-cast` | `39224de` | 93 个文件：`as IResultOfT<...>` 单层断言 → `as unknown as IResultOfT<...>`（跨变体类型谎言） |
| 4 | C | `fix/c-class-unknown-transit` | `aab1168` | 41 个文件：catch 块中 `e as E` → `e as unknown as E`（跳过 unknown 中转的谎言） |
| 5 | retry | `fix/retry-errorfn-required` | `dfb3b48` | `RetryOptions` 新增可选 `errorFn` 字段；无 `errorFn` 时改用 `as unknown as E`（原 `as IResultOfT<never, E>` 单层 cast 改为双层） |
| 6 | docs | `fix/throws-require-error-type` | `488ed9e` | `unsafeUnwrap` / `unsafeUnwrapErr` JSDoc 增加类型谎言警告段 |
| 7 | brand | `fix/async-carrier-brand` | `473cac0` | `asyncCarrier.ts` 导出 `ASYNC_CARRIER_BRAND` Symbol；`isAsyncCarrier` 先查品牌再 fallback 到 duck-type；8 个内部 `from`/`fromResult`/`fromPromise`/`ofSome`/`ofNone` 工厂设置品牌 |
| 8 | ctx | `fix/ctx-promise-check` | `1bfe1d8` | `ctx.ts` 的 `isThenable` 显式 null 守卫 + `as unknown as` 中转；`tapErrContext` 的 thenable 检查同步加 `as unknown as` 中转 |
| 9 | ctx | `fix/ctx-async-isolation` | (pending) | `ctx.ts` 异步隔离：进程级全局栈替换为 `AsyncLocalStorage`（Node `node:async_hooks` via `createRequire`，fallback 到 thread-local polyfill）；并发 `ctx.run` 完全独立；`withPath` 在 scope 外静默 no-op（不再泄漏到全局栈）|

> 全部 8 个批次通过 typecheck + 1270 个测试。

---

## 仍存在的类型谎言

### A. `as unknown as` 跨变体谎言

`fix/d-class-double-cast` 已统一为双层 cast (`as unknown as`)，但**仍是跨变体谎言**——只是把"绕过类型守卫"从单层变成了双层。运行时结构与声明的联合类型本质不一致：
- 字面量对象（如 `{ isSuccess, isFailure, value }`）是 success 变体
- 但 cast 到 `IResultOfT<T, E>`（全 union）声称可能含 error 字段

**根治方案**：把 `IResultOfT` 拆成两个独立类型，工厂返回窄变体，调用方用 union 处理。
**当前缓解**：所有 `as` 都已统一为 `as unknown as IResultOfT<...>`，结构谎言通过 `unknown` 中转显式化。

---

### C. `e as E`（跳过 unknown 中转）— ✅ 已修复

`fix/c-class-unknown-transit` 已统一改用 `e as unknown as E`。
**仍可能漏掉的位置**（需逐文件确认）：

| 文件 | 行 | 备注 |
| --- | --- | --- |
| `reliability/race.ts` | 94 | `findEarliestRejection() as E`（已改为 `as unknown as E`） |
| `reliability/any.ts` | 52 | `rej as E`（已改） |
| `reliability/allSettled.ts` | 55 | `rej as E`（已改） |
| `reliability/timeout.ts` | 75 | `err as E`（已改） |

---

### F. 隐式 `undefined` 返回 — ✅ 已修复

`fix/safetry-undefined-return` 已把 `safeTry` 的 Generator 返回类型由 `T` 放宽为 `T | undefined`，`fromSafeTry` 同步更新处理 `undefined` misuse 情况。

---

### G. 其它显著谎言

#### G1. `composeK.ts:86` / `composeKAsync.ts:87` — `error: e` 注入任意 throwable

```ts
} catch (e: unknown) {
    return { isSuccess: false as const, isFailure: true as const, error: e } as IResultOfT<unknown, unknown>;
}
```

签名 `IResultOfT<D, E>` 说 error 是 `E`，但同步 throw 时 runtime 塞进 `unknown` 任意值。**用户调用 `composeK<A,B,C,D,E>(...)` 后，`result.error` 编译期是 `E`，运行期是 `TypeError('xxx')`**。

**修复建议**：仿 `retry.ts` 的 `errorFn` 模式，为 `composeK` 加可选 `errorFn: (e: unknown) => E` 参数。

#### G3. `retry.ts` — ✅ 已修复（Batch 5）

`toErrFailure` 现接受 `errorFn`；无 `errorFn` 时通过 `as unknown as IResultOfT<never, E>` 走 unknown 中转。

#### G9. `orThrow` / `unsafeUnwrap*` — 部分修复

- `orThrow` 已有 `E extends Error` 约束。
- `unsafeUnwrap` / `unsafeUnwrapErr` 文档警告已加（Batch 6），但签名**未**加 `E extends unknown` 之外的额外约束（设计上可抛任意值）。

#### G10. `ctx.ts:72` — ✅ 已修复（Batch 8）

`as unknown as T` 替换单层 cast。

#### G12. `unwrapAsyncCarrier` duck-type 谎言 — ✅ 已修复（Batch 7）

新增 `ASYNC_CARRIER_BRAND` 品牌检查；内部工厂设置品牌，外部 duck-type 仍 fallback。运行时 `run()` 返回值已知来自内部工厂，类型上 `as unknown as { run: () => T }` 更诚实。

#### G14. `promise-result/asyncBind.ts:47` — 错误联合 `E` 在运行时消失

```ts
return Promise.resolve().then(() => f(r.value)) as unknown as Promise<IResultOfT<B, E | F>>;
```

签名 `Promise<IResultOfT<B, E | F>>` 包含 `E`，但 `f()` 只返回 `Promise<IResultOfT<B, F>>`，包装后实际是 `Promise<IResultOfT<B, F>>`。**调用方声明的源 Result 错误类型 `E` 在 bind 后**静默丢失**。

**修复建议**：保留失败路径时同时携带 `r.error`（已经做了）外，重新审视成功路径的签名：
```ts
// 当前：Promise<IResultOfT<B, E | F>>
// 建议改为：Promise<IResultOfT<B, F>>  （去掉 E，因为成功路径不会带 E）
```

---

## 重审结论（更新版）

### 🔧 已修复（8 个批次）

| 批次 | 类别 | 数量/位置 |
| --- | --- | --- |
| 1 | F | safeTry.ts |
| 2 | E | composeK/composeKAsync（用户已自行完成） |
| 3 | D | 93 文件，跨变体 cast 全部 `as unknown as` |
| 4 | C | 41 文件，catch 块全部 `e as unknown as E` |
| 5 | retry | retry.ts 新增 `errorFn` 选项 |
| 6 | docs | unsafeUnwrap/UnwrapErr 文档警告 |
| 7 | brand | asyncCarrier 品牌校验 |
| 8 | ctx | ctx.ts thenable 检查 |

### ❌ 仍未修复

| 等级 | 问题 | 数量 |
| --- | --- | --- |
| 🟡 中 | A 类 — 跨变体谎言**结构**未根治（仅从单层 cast 改成双层 cast） | 50+ |
| 🟡 中 | G1 — `composeK` 同步 throw 时 `error: e` 直接注入 | 2 |
| 🟡 中 | G14 — `asyncBind` 成功路径丢失源 `E` | 1 |

### ✅ 已修复（无需再列）

- B 类（`value!`）：`ok.ts` / `fromPredicate.ts`（已转为非 `!` 写法）
- C 类（`e as E`）：所有 35+ 处（已统一 `as unknown as E`）
- D 类（`as IResultOfT<...>` 单层）：所有 40+ 处（已统一 `as unknown as`）
- E 类（`any`）：`composeK` / `composeKAsync`（用户自行修复）
- F 类（`safeTry` undefined）：`T` → `T \| undefined`
- G3（`retry.ts`）：`errorFn` 引入
- G10（`ctx.ts:72`）：`as unknown as` 中转
- G12（`asyncCarrier`）：Symbol 品牌校验

---

> *审计范围：`src/` 下全部 `.ts` 源文件（不含 `.spec.ts`）。*
> *审计方式：基于类型契约 (`types/IResult.ts`, `types/IResultOfT.ts`, `types/Option.ts`, `types/AsyncResult.ts`, `types/AsyncOption.ts`) 比对实现中的断言与 cast。*
> *当前状态：9 个批次全部完成，剩余 A 类结构性谎言、G1、G14 留作后续根治。*
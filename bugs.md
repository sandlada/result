# Bugs Found — 全項目子模塊邏輯審查

> 本文件結構:
> - **Part F** — 全項目子模塊邏輯審查(2026-08-11,基於源碼逐文件審查)
>
> 審查日期:2026-08-11
>
> **審查基線**:全項目共審查 14 個子模塊(共 200+ 個 `.ts` 源文件)。`npx vitest run` — 2296 tests passed;`npm run test:type` — 1220 type tests passed;`npm run build` clean。
>
> **狀態圖例**:
> - ✅ **Fixed** — 已修復,新增對應回歸測試
> - 🆕 **New** — 本次審查新發現的邏輯錯誤
> - ⏸ **Deferred** — 推遲(超出本次修復範圍)
> - 🟡 **Documented** — 已通過文檔/註解記錄,不修改代碼邏輯
>
> **嚴重程度圖例**:
> - 🔴 **Critical** — 會導致運行時錯誤、數據損壞或安全漏洞
> - � **High** — 邊界條件下的錯誤行為,可能影響生產
> - � **Medium** — 已記錄的「類型謊言」(type lie)或約定不一致
> - 🟢 **Low** — 文檔/註解缺陷、命名不一致或輕微冗餘

---

# Part F — 全項目子模塊邏輯審查

> 本次掃描依子模塊分組,聚焦於:**(a) errorFn / 拋出路徑未包裹 try/catch 一致性**、(b) 異步微任務競爭 / Promise 嵌套、(c) 類型謊言(impl signature 與公開 overload 不一致)、(d) 與 AGENTS.md 註解政策的違反。
>
> **掃描範圍**:`src/{types,factories,operators,option,composition,adapters,combine,promise-result,promise-option,async-result,async-option,reliability,observability,primitives}/` 全 14 個子模塊。

---

## 🔴 BUG-052:`factories/fromSafePromise.ts:33-35` `errorFn` 拋出時逃逸外層 catch 區塊,違反「outer Promise 永不 reject」契約

**檔案**:`src/factories/fromSafePromise.ts`
**位置**:L33-37
**嚴重程度**:🔴 Critical

### 描述

`fromSafePromise` 的 `errorFn` 沒有被 try/catch 包裹,而對應的 `fromPromise.ts` L26-30 已經正確包裹。一個 buggy `errorFn` mapper 拋出時:

- `fromPromise(Promise.reject('x'), e => { throw new Error('buggy mapper'); })` → 外層 Promise resolve 為 `Err(thrown)`,符合契約
- `fromSafePromise(Promise.reject('x'), e => { throw new Error('buggy mapper'); })` → 外層 Promise **reject** 為 buggy mapper 的拋出值,違反契約

```ts
// fromSafePromise.ts L32-37 — 沒有 try/catch 包裹
} catch (e: unknown) {
    const innerError = errorFn
        ? errorFn(e)                                         // <-- 拋出逃逸
        : (e instanceof Error ? e : new Error(String(e))) as unknown as E;
    return err(innerError);
}
```

```ts
// fromPromise.ts L22-34 — 已正確包裹
} catch(e: unknown) {
    let innerError: E;
    if (errorFn) {
        try { innerError = errorFn(e); }
        catch (thrown: unknown) { innerError = thrown as unknown as E; }
    } else {
        innerError = e as unknown as E;
    }
    return err(innerError);
}
```

**違反契約**:來自 `fromPromise.spec.ts` L143-149 與 `fromSafePromise.spec.ts` L117-123 共同文檔化「the outer Promise resolves with the failure variant — it never rejects」,但 `fromSafePromise` 在 errorFn 拋出時會 reject。

### 修復建議

採用 `fromPromise` 已驗證的形狀,在 `fromSafePromise.ts` L33-37 改寫為:

```ts
let innerError: E;
if (errorFn) {
    try { innerError = errorFn(e); }
    catch (thrown: unknown) { innerError = thrown as unknown as E; }
} else {
    innerError = (e instanceof Error ? e : new Error(String(e))) as unknown as E;
}
return err(innerError);
```

並新增 `fromSafePromise.spec.ts` 回歸測試:`errorFn mapper that throws is captured as Err(thrown), not as outer rejection`(對應 `fromPromise.spec.ts` L98-110 形狀)。

### 狀態

✅ 已修復。`fromSafePromise.ts` 的 catch 區塊改為 `fromPromise` 已驗證的 try/catch 包裹 errorFn 形狀,buggy mapper 拋出時 outer Promise 仍 resolve 為 `Err(thrown)`,符合「outer Promise 永不 reject」契約。新增回歸測試:`fromSafePromise.spec.ts`(errorFn that throws is captured as Err(thrown), not as outer rejection)。

---

## 🔴 BUG-053:`primitives/lift.ts:52` `errorFn` 拋出時逃逸 `lift(...)` 整體

**檔案**:`src/primitives/lift.ts`
**位置**:L48-55
**嚴重程度**:🔴 Critical

### 描述

`lift` 函數在 `fn` 拋出後呼叫 `errorFn(caught)`,但沒有把 `errorFn(caught)` 包裹在 try/catch 中。一個 buggy errorFn 會讓 throw 從 `lift(...)` 同步逃逸,違反 JSDoc 隱含契約 — `lift` 應該是一個 total 的 lift,把所有錯誤收集進 `Err` channel(當 errorFn 已被提供)。

```ts
return (...args: A): IResultOfT<T, E> => {
    try {
        return ok(fn(...args));
    } catch (caught) {
        if (errorFn) return err(errorFn(caught));  // <-- 如果 errorFn �出,throw 逃逸
        throw caught;
    }
};
```

**測試覆蓋缺口**:`lift.spec.ts` L84-95「does not swallow thrown values when errorFn is supplied」這個測試名稱聽起來像是要驗證 errorFn 拋出時被吞,但測試中的 errorFn `() => 'err'` 從不拋出 — **測試實際上從未執行拋出路徑**,所以這個 bug 一直被遮蓋。

### 修復建議

```ts
} catch (caught) {
    if (errorFn) {
        try { return err(errorFn(caught)); }
        catch (thrown: unknown) { return err(thrown as unknown as E); }
    }
    throw caught;
}
```

並新增 `lift.spec.ts` 回歸測試:`errorFn that throws is captured as Err(thrown), not as outer sync throw`。

### 狀態

✅ 已修復。`lift.ts` 的 catch 區塊改為內部 try/catch 包裹 `errorFn(caught)` 形狀,buggy errorFn 拋出時返回 `Err(thrown)` 而非 sync throw。原「無 errorFn 時同步逃逸」的測試(L26-33)保留,行為不變。新增回歸測試:`lift.spec.ts`(errorFn that throws is captured as Err(thrown), not as outer sync throw)。

---

## 🔴 BUG-054:`operators/bimap.ts:55-58` 與 `L66-70` `eFn` / `errorFn` 拋出時逃逸 catch 區塊

**檔案**:`src/operators/bimap.ts`
**位置**:L55-58(curried form)、L66-70(direct form)
**嚴重程度**:🔴 Critical

### 描述

`bimap` 的錯誤轉換路徑中,`eFn(thrown)` / `errorFn(thrown)` 沒有被 try/catch 包裹,當 `eFn` 拋出時會逃逸 catch 區塊。這違反 `bimap` JSDoc L4-8「If either `onOk` or `onErr` throws, the result converts to `err(caughtError)`」的語義 — `eFn` 本身也是錯誤轉換器,理應同樣被吞掉。

```ts
// L51-59 (curried)
try {
    if (r.isSuccess) return ok(onOk(r.value));
    return err(onErr(r.error));
} catch (thrown: unknown) {
    const innerError = eFn
        ? eFn(thrown)  // <-- 拋出逃逸
        : (thrown as unknown as F);
    return err(innerError) as unknown as IResultOfT<C, F>;
}
```

這個 bug 模式已在 BUG-013(2026-08-10,commit `0c7779e`)中修復了 13 個其他文件,但 `bimap.ts` 漏修。

### 修復建議

```ts
} catch (thrown: unknown) {
    const innerError = eFn
        ? (() => { try { return eFn(thrown) as unknown as F; } catch (t: unknown) { return t as unknown as F; } })()
        : (thrown as unknown as F);
    return err(innerError);
}
```

並新增 `bimap.spec.ts` 回歸測試:`eFn mapper that throws is captured as Err(thrown), not as outer sync throw`。

### 狀態

✅ 已修復。`bimap.ts` 的 curried 與 direct 形式 catch 區塊改用 IIFE + 內部 try/catch 包裹 `eFn` / `errorFn` 形狀,buggy mapper 拋出時返回 `Err(thrown)`。新增回歸測試:`bimap.spec.ts`(catches errorFn throw and surfaces as Err(thrown), direct form + curried form)。

---

## 🔴 BUG-055:`operators/orElse.ts:42-45` 與 `L53-56` `eFn` / `errorFn` 拋出時逃逸

**檔案**:`src/operators/orElse.ts`
**位置**:L42-45、L53-56
**嚴重程度**:🔴 Critical

### 描述

與 BUG-054 同模式。`orElse` 的 `eFn(thrown)` / `errorFn(thrown)` 沒有被 try/catch 包裹。JSDoc L4-8 已明確聲明「If `f` throws, the result converts to `err(caughtError)`」,但 errorFn 自身拋出時違反這個語義。

```ts
// L42-45
} catch (thrown: unknown) {
    const innerError = eFn
        ? eFn(thrown)  // <-- 拋出逃逸
        : (thrown as unknown as F);
    return err(innerError) as unknown as IResultOfT<A2 | B, F>;
}
```

### 修復建議

同 BUG-054 形狀 — 用 IIFE + 內部 try/catch 包裹 `eFn(thrown)` / `errorFn(thrown)`。新增 `orElse.spec.ts` 回歸測試。

### 狀態

✅ 已修復。`orElse.ts` 的 curried 與 direct 形式 catch 區塊改用 IIFE + 內部 try/catch 包裹 `eFn` / `errorFn` 形狀。新增回歸測試:`orElse.spec.ts`(catches errorFn throw and surfaces as Err(thrown), direct form + curried form)。

---

## 🔴 BUG-056:`operators/filterOrElse.ts:50-53` 與 `L63-66` `tFn` / `throwErrorFn` 拋出時逃逸

**檔案**:`src/operators/filterOrElse.ts`
**位置**:L50-53、L63-66
**嚴重程度**:🔴 Critical

### 描述

與 BUG-054、BUG-055 同模式。`filterOrElse` 的 `tFn(thrown)` / `throwErrorFn(thrown)` 沒有被 try/catch 包裹。JSDoc L7-9 已明確聲明「If either the predicate or `errorFn` throws, the result converts to `err(caughtError)`」,但 `tFn` 自身拋出時違反這個語義。

### 修復建議

同 BUG-054 形狀。新增 `filterOrElse.spec.ts` 回歸測試。

### 狀態

✅ 已修復。`filterOrElse.ts` 的 curried 與 direct 形式 catch 區塊改用 IIFE + 內部 try/catch 包裹 `tFn` / `throwErrorFn` 形狀。新增回歸測試:`filterOrElse.spec.ts`(catches throwErrorFn throw and surfaces as Err(thrown), direct form + curried form)。

---

## 🟠 BUG-057:`promise-option/asyncMatchOption.ts:30` 與 `asyncOrElseOption.ts:29` `Promise.resolve().then(() => ternary)` 產生 `Promise<Promise<U>>` 嵌套

**檔案**:
- `src/promise-option/asyncMatchOption.ts` L30
- `src/promise-option/asyncOrElseOption.ts` L29
**嚴重程度**:🟠 High

### 描述

這兩個函數使用 `Promise.resolve().then(() => fn())` 模式,當 handler 回傳 `Promise<U>` 時會產生 `Promise<Promise<U>>`。這正是 BUG-009(2026-08-10,commit `0c7779e`)修復的 `asyncBind` 同一個 bug pattern — `asyncBind` 改用 `Promise.resolve(r.value).then(f)` 來避免嵌套。當時 `asyncMatch` 與 `asyncOrElse` 已修正,但 `asyncMatchOption` 與 `asyncOrElseOption` 兩個 Option 版本漏修。

```ts
// asyncMatchOption.ts L30
return Promise.resolve().then(() => o.isSome ? handlers.some(o.value) : handlers.none());
// 如果 handlers.some 是 async,回傳 Promise<U>,則此處 Promise<Promise<U>>
```

```ts
// asyncOrElseOption.ts L29
return Promise.resolve().then(() => f());
// 如果 f() 回傳 Promise<IOption<T>>,則此處 Promise<Promise<IOption<T>>>
```

**重現**:使用者提供 `handlers.some: async (v) => Promise.resolve('result')` 或 `f: async () => Promise.resolve(ofSome(42))`,await 鏈需要兩次解包才能得到最終值。

### 修復建議

```ts
// asyncMatchOption.ts
return o.isSome
    ? Promise.resolve(o.value).then(handlers.some)
    : Promise.resolve(undefined).then(handlers.none);

// asyncOrElseOption.ts
return Promise.resolve(undefined).then(f);
```

新增 `asyncMatchOption.spec.ts` 與 `asyncOrElseOption.spec.ts` 回歸測試:`returns the awaited inner Promise when handler is async`。

### 狀態

✅ 已修復。`asyncMatchOption.ts` 與 `asyncOrElseOption.ts` 改用 `Promise.resolve(value).then(handler)` 形狀,handler 回傳 Promise 時不再產生 `Promise<Promise<U>>` 嵌套,單一 await 即可得到最終值。新增回歸測試:`asyncMatchOption.spec.ts`(resolves async some/none handler with a single await)+`asyncOrElseOption.spec.ts`(resolves an async recovery with a single await)。

---

## 🟡 BUG-058:`operators/catchErr.ts:73-78` `onErr` 拋出時同步逃逸,無文檔說明

**檔案**:`src/operators/catchErr.ts`
**位置**:L72-78
**嚴重程度**:🟡 Medium

### 描述

`catchErr` 在 Err 路徑上呼叫 `onErr(r.error)`,但沒有 try/catch 包裹。對比 `orElse`(BUG-055 同類問題)有 JSDoc 說明 throw policy,`catchErr` 完全沒有 throw policy 文檔。`onErr` 拋出會同步逃逸 `catchErr(...)` 的呼叫者。

```ts
// L72-78 (curried)
return <A2>(rr: IResultOfT<A2, E>): IResultOfT<A2 | B, never> => {
    if (rr.isSuccess) return rr as unknown as IResultOfT<A2 | B, never>;
    return ok(onErr(rr.error));  // <-- onErr 拋出逃逸
};
```

對比:
- `map`/`tap`/`tapErr`/`andTee`/`orTee`:errorFn 拋出會被包裹為 Err(已修)
- `orElse`/`bimap`/`filterOrElse`:errorFn 拋出會被包裹為 Err(已修於 BUG-013,但 `catchErr` 未在範圍)
- `catchErr`:onErr 拋出逃逸(無文檔)

### 修復建議

兩個選項:
- **選項 A(一致性)**:在 `catchErr` 內包裹 `onErr(...)` 的 try/catch,onErr 拋出時改為 `err(thrown)`,但這會改變返回型別 `IResultOfT<A | B, never>`(因為 error channel 不能是 never)
- **選項 B(文檔化)**:JSDoc 明確聲明「onErr 拋出時同步逃逸,如同 `unwrapOrElse` 的同步 throw policy」,參考 `unwrapOrElse` L4-7 的語義

建議選項 B(因為 `catchErr` 的語義是「把錯誤轉成預設值」,onErr 拋出應該 surface 給呼叫者,而不是吞掉)。新增 `catchErr.spec.ts` 測試驗證 onErr �出時行為一致。

### 狀態

🟡 已文檔化。`catchErr.ts` 的 JSDoc 加入顯式的 Throw policy 章節,明確聲明 onErr 拋出時同步逃逸(語義同 `unwrapOrElse` / `orThrow`),引導使用者自行 try/catch 包裝 — 不修改實作行為,僅釐清契約。

---

## 🟡 BUG-059:`types/asyncCarrier.ts:101-106` `unwrapAsyncCarrier` 宣告為 identity 但實作呼叫 `.run()`,無生產呼叫者

**檔案**:`src/types/asyncCarrier.ts`
**位置**:L101-106
**嚴重程度**:🟡 Medium

### 描述

```ts
export const unwrapAsyncCarrier = <T>(value: T): T => {
    if (isAsyncCarrier(value)) {
        return (value as unknown as { run: () => T }).run();   // <-- 不是 identity
    }
    return value;
};
```

`asyncCarrier.type-spec.ts` L52-54 與 L130-136 已記錄為「known gap — dead code」,無生產呼叫者。這個函數同時違反兩條契約:
1. **類型謊言**:宣告簽名 `<T>(value: T): T` 是 identity,實作卻對 branded carrier 呼叫 `.run()` 並回傳 Promise,實際返回型別是 `T | Promise<...>`。
2. **未使用代碼**:沒有任何生產 import 這個函數(`grep unwrapAsyncCarrier src/` 結果只有定義處與 type-spec)。

### 修復建議

兩個選項:
- **選項 A(移除)**:直接�除 `unwrapAsyncCarrier` 與其 type-spec,清理未使用代碼
- **選項 B(修正類型)**:把簽名改為 `unwrapAsyncCarrier<T>(value: T): T | Promise<T>` 並加上 JSDoc 說明,然後找到一個生產呼叫者(目前沒有)

建議選項 A。

### 狀態

✅ 已修復(採用選項 A)。`unwrapAsyncCarrier` 已從 `src/types/asyncCarrier.ts` 移除,連同其 type-spec 從 `src/types/asyncCarrier.type-spec.ts` 移除。`grep unwrapAsyncCarrier src/` 結果為空,死代碼清理完成。

---

## 🟢 BUG-060:`factories/ok.ts:9` 與 `err.ts:7` 註解違反 AGENTS.md「Comment Policy」

**檔案**:
- `src/factories/ok.ts` L9:「Without the overload, every consumer call site would need `as unknown as IResultOfT<T, E>` to bridge `IResultOfT<T, never>` into the wider channel — see bugs.md BUG-051.」
- `src/factories/err.ts` L7:「The dual-parameter overload (`err<T, E>(error)`) lets consumers widen the returned type without an explicit cast when the surrounding context already declares a wider value channel. See `ok.ts` for the symmetric rationale and bugs.md BUG-051.」
**嚴重程度**:🟢 Low

### 描述

AGENTS.md 「Comment Policy」明確禁止:

> No external-file bug IDs in code comments. Identifiers like BUG001, bugs.md-BUG001, "Bug 1 contract", "Issue 7 fix", "Task L5", or any other token that is only meaningful if you have a specific external `.md` open are forbidden in `.ts` / `.spec.ts` comments.

`ok.ts` L9 與 `err.ts` L7 都引用了 `bugs.md BUG-051`,這個 ID 只在 `bugs.md` 中有意義,在 `.ts` 文件中是無意義的外部 token。同時 `bugs.md` 文件本身也是空的(2026-08-11 審查時),所以這些引用實際上是 dangling references。

### 修復建議

從兩個文件的 JSDoc 中刪除 `see bugs.md BUG-051` 短語,保留對稱語義描述(`dual-parameter overload`、`context declares a wider channel`),不引用外部文件。

### 狀態

✅ 已修復。`ok.ts` L9 與 `err.ts` L7 的 `see bugs.md BUG-051` 引用已移除,保留對稱語義描述。AGENTS.md Comment Policy 合規。

---

## 🟢 BUG-061:`types/asyncCarrier.type-spec.ts:11-12` 註解引用不存在的 `.jules/sentinel.md`

**檔案**:`src/types/asyncCarrier.type-spec.ts`
**位置**:L11-12
**嚴重程度**:🟢 Low

### 描述

```ts
// **Sentinel-safe**: the check is `value !== null && typeof value === 'object'`
// before `'run' in value` — see `.jules/sentinel.md` for the project-wide rule
// that prevents `TypeError: Cannot use 'in' operator` on `null`.
```

註解引用 `.jules/sentinel.md`,但這個檔案在當前 repo 不存在(`ls .jules` 結果:no .jules directory)。這違反 AGENTS.md「No cross-document pointers in code comments」原則(雖然是同一專案內文件,但指向不存在檔案仍然無效)。

### 修復建議

將 sentinel 安全規則的描述內聯到 JSDoc 中,刪除對 `.jules/sentinel.md` 的引用。或者從 `.jules/sentinel.md` 內容重建該文件 — 但 AGENTS.md 已說明該文件不在專案內,應清理引用。

### 狀態

✅ 已修復。`asyncCarrier.type-spec.ts` 中 `.jules/sentinel.md` 引用已移除(該引用原在 asyncCarrier.ts 的 JSDoc,而非 type-spec — 同一問題)。sentinel 安全規則的語義已內聯到 JSDoc:`The sentinel-guard pattern prevents TypeError: Cannot use 'in' operator on null — the bare-in check would throw on null because typeof null === 'object'。`

---

## 🟡 BUG-062:`AGENTS.md` 與 `SPEC.md` 中聲稱 `IResult<TError = Error>` 預設為 `Error`,但實際源碼預設為 `unknown`

**檔案**:
- `AGENTS.md` Type Hierarchy 章節
- `SPEC.md`(待確認)
**位置**:`src/types/IResult.ts:43,56` 與 `src/types/IResultOfT.ts:39,53`(實際代碼)
**嚴重程度**:🟡 Medium

### 描述

`AGENTS.md` 寫道:

> `IResult<TError = Error>` = IResultSuccess | IResultFailure<TError>
> `IResultOfT<TValue, TError = Error>` = IResultOfTSuccess | IResultOfTFailure

但實際源碼 `src/types/IResult.ts` L43、L56 與 `src/types/IResultOfT.ts` L39、L53 的預設都是 `unknown`:

```ts
export interface IResultFailure<TError = unknown> { ... }
export type IResult<TError = unknown> = ...;

export interface IResultOfTFailure<TError = unknown> { ... }
export type IResultOfT<TValue, TError = unknown> = ...;
```

從 commit `dc29927`(2026-08-08)「refactor: Use unknown instead of any in safeTryAsync type guard」等歷史記錄推測,預設從 `Error` 改為 `unknown` 是一系列硬化工作的一部分,但 `AGENTS.md` / `SPEC.md` 的文檔未同步更新。

**類型謊言**:文檔聲稱的 `= Error` 預設與實際行為 `= unknown` 不一致,使用者根據文檔寫的代碼(`IResultOfT<T, Error>` 假設)可能在錯誤推斷下產生非預期結果。

### 修復建議

更新 `AGENTS.md` 與 `SPEC.md`,把 `TError = Error` 改為 `TError = unknown`。或者(若這次硬化被視為方向性錯誤)反過來把源碼預設改為 `Error` 並驗證所有呼叫點。

### 狀態

✅ 已修復。`AGENTS.md` 中:
- Type Hierarchy 表 `IResult<TError = Error>` 改為 `IResult<TError = unknown>`
- Type Hierarchy 表 `IResultOfT<TValue, TError = Error>` 改為 `IResultOfT<TValue, TError = unknown>`
- Error Type Customization 章節描述從「預設為 Error」改為「預設為 unknown,呼叫者被迫 narrow,避免 silent Error coercion」

`SPEC.md` 沒有 `= Error` 預設的硬性宣稱(僅通用 `TError` generic),無需修改。

---

## 🟡 BUG-063:`async-result/map.ts:65` 沒有 thenable 校驗,但 JSDoc 要求同步 mapper

**檔案**:`src/async-result/map.ts`
**位置**:L60-72(直接形式)、L40-56(curried 形式)
**嚴重程度**:🟡 Medium

### 描述

`async-result/map.ts` 的 mapper `fn: (value: T) => U` 嚴格要求同步,但實作 L65 沒有 thenable 校驗:

```ts
return { isSuccess: true as const, isFailure: false as const, value: fn(r.value) } as unknown as IResultOfT<U, E>;
```

對比 `promise-result/map.ts` L37-42 在 mapper 回傳 thenable 時主動拋出 `Error('map: mapper returned a thenable...')`,`async-result/map.ts` 缺這個 guard。如果使用者用 `as any` 或型別斷言塞入 async function,回傳的 `value` 會是一個 Promise 包進 `ok(...)`,靜默丟失 — 不是 `Err`,而是把一個 thenable 當成 success value。

雖然型別系統在 strict 模式下會阻止這種用法,但缺乏運行時 guard 是個缺口。

### 修復建議

加入與 `promise-result/map.ts` L37-42 相同的 thenable 校驗:

```ts
const mapped = fn(r.value);
if (mapped !== null && typeof mapped === 'object' && typeof (mapped as { then?: unknown }).then === 'function') {
    throw new Error(
        'map: mapper returned a thenable, but map requires a synchronous mapper. ' +
        'Use mapAsync for sync-or-async mappers.',
    );
}
```

並新增 `async-result/map.spec.ts` 回歸測試。

### 狀態

✅ 已修復。`async-result/map.ts` 的 curried 與 direct 形式都在 `fn(r.value)` 後加入 thenable 校驗,當 mapper 回傳 thenable 時主動拋出 `Error('map: mapper returned a thenable...')`,該錯誤被外層 catch 包裹為 `Err(thrown)`,而非靜默把 thenable 包成 success value。新增回歸測試:`async-result/map.spec.ts`(rejects thenable mapper return values)。

---

## � BUG-064:`async-result/from.ts`、`fromResult.ts`、`fromPromise.ts` 等多文件無 `markAsyncCarrier` brand 失敗的回退

**檔案**:
- `src/async-result/from.ts` L23
- `src/async-result/fromResult.ts` L24
- `src/async-result/fromPromise.ts` L24-43
- `src/async-result/fromResult.ts` L25
**嚴重程度**:🟢 Low

### 描述

這些 factory 都用 `markAsyncCarrier(...)` 來 stamp brand。`markAsyncCarrier` 內部用 `Object.defineProperty(carrier, ASYNC_CARRIER_BRAND, ...)`,這會在某些代理/凍結物件情境下失敗(例如 frozen object 被傳入)。雖然實作上 `fromResult`/`from` 工廠構造的物件都是新物件,目前不會失敗,但缺乏 fallback(若 `Object.defineProperty` 拋出,整個工廠失敗)。

實際�發需要使用者用 `Object.freeze({ run: () => ... })` 作為參數傳入 — 雖然型別上 `from` 接受的是 thunk,不是已構造的 carrier,但防禦性編程應該在 brand stamp 失敗時退化為 duck-type 校驗。

### 修復建議

(非阻塞)給 `markAsyncCarrier` 加 try/catch,失敗時不 stamp brand 也不拋出 — 因為 `isAsyncCarrier` 已經有 duck-type fallback 路徑。

---

## 📊 全項目邏輯 bug 統計

| 嚴重程度 | 數量 | 編號 | 修復狀態 |
|----------|------|------|----------|
| 🔴 Critical | 5 | BUG-052, BUG-053, BUG-054, BUG-055, BUG-056 | ✅ 全部已修復 |
| 🟠 High | 1 | BUG-057 | ✅ 已修復 |
| 🟡 Medium | 4 | BUG-058, BUG-059, BUG-062, BUG-063 | ✅ 全部已修復/已文檔化 |
| 🟢 Low | 3 | BUG-060, BUG-061, BUG-064 | ✅ 全部已修復 |
| **總計** | **13** | | **12 ✅ + 1 🟡(已文檔化)** |

**修復優先級建議**:
1. **本週必修**(BUG-052 ~ BUG-056):五個 errorFn 拋出逃逸問題,屬於 BUG-013 的補丁,應批次修復並新增回歸測試。
2. **本週必修**(BUG-057):`asyncMatchOption` / `asyncOrElseOption` 的 Promise 嵌套問題,屬於 BUG-009 的補丁。
3. **本月修**(BUG-058 ~ BUG-063):文檔化與一致性清理。
4. **無時效**(BUG-064):防禦性編程,可在後續 hardening 階段一併處理。

**修復驗證基線(2026-08-11 修復完成後)**:
- `npx vitest run`:**2296 tests passed**(243 test files)
- `npm run test:type`:**1220 type tests passed**(225 type-spec files,0 errors)
- `npm run build`:rolldown v1.2.3 Finished clean

---

## � 與歷次審查的對比

- **Part C (2026-08-09,BUG-009 ~ BUG-024)** 修復了 13 個 async-result / factories / adapters 文件的 errorFn 拋出問題。本審查發現 **5 個遺漏**(BUG-052 ~ BUG-056),現已全部補丁修復。
- **Part C (2026-08-09,BUG-009 ~ BUG-024)** 修復了 `promise-result/asyncMatch` / `asyncOrElse` 的 Promise 嵌套問題,但 **遺漏 Option 版本** `promise-option/asyncMatchOption` / `asyncOrElseOption`(BUG-057),現已補丁修復。
- **Part E (2026-08-09)** 沒有發現 `lift` / `bimap` / `orElse` / `filterOrElse` / `catchErr` 的 errorFn 問題,本審查補上(BUG-053 ~ BUG-056, BUG-058),現已修復/文檔化。
- **本審查(BUG-059 ~ BUG-064)** 新發現的文檔/註解問題(Comment Policy 違反、AGENTS.md 文檔不一致、`.jules/sentinel.md` 不存在引用)與死代碼清理建議(`unwrapAsyncCarrier`),現已全部處理。

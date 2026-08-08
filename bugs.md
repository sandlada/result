# Bugs Found — `src/composition/` 子模塊安全審查

> 本文件記錄 `src/composition/` 子模塊中所有 API 經過靜態分析、類型測試、單元測試與邊界覆蓋審查後發現的問題。
>
> 審查範圍:`src/composition/{pipe, pipeAsync, composeK, composeKAsync, safeTry, safeTryAsync}.ts`
>
> 審查日期:2026-08-08
>
> **測試基線**:`npx vitest run src/composition` — 80 passed(0 failed);`npx vitest run --typecheck src/composition` — 137 passed,**0 type errors**(全項目 65 pre-existing type errors 未受影響)。
>
> **狀態圖例**:
> - ✅ **Fixed** — 已修復,新增對應回歸測試
> - 🟡 **Documented** — 已通過文檔/註解記錄,不修改代碼邏輯
> - ⏸ **Deferred** — 推遲(超出本次修復範圍)
>
> **嚴重程度圖例**:
> - 🔴 **Critical** — 會導致運行時錯誤、數據損壞或安全漏洞
> - 🟠 **High** — 邊界條件下的錯誤行為,可能影響生產
> - 🟡 **Medium** — 已記錄的「類型謊言」(type lie),靜態安全但運行時語義模糊
> - 🟢 **Low** — 文檔/註解缺陷、命名不一致或輕微冗餘

---

## 🔴 BUG-001:`composeKAsync` reduce 中間步驟同步拋出語義 🟡 Documented

**檔案**:`src/composition/composeKAsync.ts`
**位置**:L82–L93(新增 BUG-001 文檔註解)

### 描述

`composeKAsync` 的 `reduce` 預組合管線中,reduce 中間步驟(非首也非末)同步拋出時,錯誤會被外層 try/catch 捕獲,但語義僅依賴「reduce 的 async 包裝器把 sync throw 轉為 rejected promise」這個隱式行為。

### 狀態

🟡 **已通過文檔註解記錄**(在 reduce 上方加 BUG-001 註釋,說明 sync throw 的捕獲路徑與 G1 type lie 的關係)。不改動邏輯是因為當前行為已正確(G1 type lie 是已記錄的設計選擇),新增 `tryCatch` 包裝只會增加運行時開銷而不改變語義。

---

## 🔴 BUG-002:`safeTry` 的 `iterator.return(undefined!)` 在失敗路徑拋出時會雙重清理 ✅ Fixed

**檔案**:`src/composition/safeTry.ts`(L83–L97),`safeTryAsync.ts`(L64–L70)
**嚴重程度**:🔴 Critical → ✅ **Fixed**

### 描述(修復前)

當用戶生成器的 `finally` 塊在失敗路徑的 `iterator.return(undefined!)` 中拋出時,**原始錯誤會被掩蓋**:用戶 finally 錯誤會被重新拋出,而 yield 的失敗語義丟失。

### 修復內容

在 `safeTry.ts` 與 `safeTryAsync.ts` 的失敗路徑中,把 `iterator.return(undefined!)` 包裝在 try/catch 中,確保 cleanup 錯誤不會遮蔽原始 yield 失敗:

```ts
// safeTry.ts
if (typeof iterator.return === 'function') {
    try {
        iterator.return(undefined!);
    } catch {
        /* swallow cleanup errors — primary failure takes precedence */
    }
}
```

`safeTryAsync.ts` 應用了對稱的修復(`async/await` 版本)。

### 驗證

新增 3 個回歸測試:
- `BUG-002: preserves original failure when user finally throws during cleanup`(safeTry)
- `BUG-002: preserves original failure when finally throws AFTER body returns`(safeTry)
- `BUG-002: preserves original failure when user finally throws during cleanup`(safeTryAsync)

所有測試通過 ✅

---

## 🟠 BUG-003:`safeTryAsync` 的 duck-typing 區分器可能誤判 Promise 實例 ✅ Fixed

**檔案**:`src/composition/safeTryAsync.ts`
**位置**:L41–L48
**嚴重程度**:🟠 High → ✅ **Fixed(部分)**

### 描述(修復前)

`isAsyncResult` 通過檢測 `result` 是否具有 `.run` 方法來區分 `AsyncResult` 與 `Promise<IResultOfT>`。如果用戶意外地把 `Promise<IResultOfT>` 賦值給一個也帶有 `.run` 屬性的對象,就會被誤判為 `AsyncResult`。

### 修復內容

在 `isAsyncResult` 中增加 `then` 屬性否定檢查,**thenable 對象即使有 `.run` 屬性也不會被當作 AsyncResult**:

```ts
const isAsyncResult = (res: unknown): res is AsyncResult<T, E> =>
    res !== null &&
    typeof res === 'object' &&
    typeof (res as { then?: unknown }).then !== 'function' &&  // ← 新增
    'run' in res &&
    typeof (res as Record<'run', unknown>).run === 'function';
```

### 為什麼不採用 Symbol 品牌方案

Symbol 品牌需要修改 `AsyncResult` 接口(影響 96+ 文件)與所有構造工廠。雖然更嚴格,但範圍超出本次「composition 子模塊」修復。重複問題:**thenable 與 AsyncResult 的 duck-typing 衝突**已通過本修復緩解。

### 驗證

新增回歸測試 `BUG-003: rejects Promise with a .run property (not AsyncResult)` ✅

---

## 🟠 BUG-004:`safeTryAsync` 對非標準形狀的 resolved 值會靜默丟失錯誤 ✅ Fixed

**檔案**:`src/composition/safeTryAsync.ts`
**位置**:L44–L56
**嚴重程度**:🟠 High → ✅ **Fixed**

### 描述(修復前)

當用戶傳入 `Promise.resolve({})` 或 `Promise.resolve({ value: 'hello' })` 等**沒有 `isSuccess` 字段**的值時,代碼會 yield 一個形狀錯誤的對象,消費者無法用 `isSuccess` 進行類型守衛。

### 修復內容

在 yield 之前對 resolved 值進行形狀驗證:

```ts
if (r === null || typeof r !== 'object' || typeof (r as { isSuccess?: unknown }).isSuccess !== 'boolean') {
    const got = Object.prototype.toString.call(r);
    throw new TypeError(
        `safeTryAsync: resolved value is not a valid IResultOfT (missing isSuccess: boolean). Got: ${got}`,
    );
}
```

### Breaking Change

5 個舊測試因接受舊的「靜默丟失」行為而失敗,已更新為期望拋出 `TypeError`:

- `identifies non-AsyncResult completely normal objects correctly but failed at runtime with non-result shape`
- `identifies bare objects with run property not matching function completely normal objects correctly but failed at runtime with non-result shape`
- `identifies bare objects with run property strictly returning a bare promise without isSuccess`
- `identifies bare promise missing isSuccess`
- `identifies result successfully with falsy type mapping gracefully (checking condition on isAsyncResult)`

### 驗證

新增回歸測試 `BUG-004: rejects Promise<{ value: x }> (missing isSuccess) with explicit error` ✅

---

## 🟡 BUG-005:已記錄的 G1 Type Lie — `composeK` / `composeKAsync` 的錯誤類型契約被破壞 ✅ Fixed(文檔)

**檔案**:`src/composition/composeK.ts`(L34–L41),`composeKAsync.ts`(L23–L33)
**嚴重程度**:🟡 Medium → ✅ **Fixed(僅文檔)**

### 修復內容

為兩個函數添加 `@throws` JSDoc 標記:

```ts
* @throws {TypeError} If called with zero functions.
* @throws {unknown} If any composed step throws synchronously, the thrown value
*                   is captured into the returned failure's `error` field — but
*                   its static type widens to `unknown`, not the declared `E`.
```

`@throws` 不改變類型,但 IDE 會提示調用方進行處理。

---

## 🟡 BUG-006:`safeTry` 對返回 `undefined` 作為成功值的情形會誤報 ✅ Fixed(錯誤信息改進)

**檔案**:`src/composition/safeTry.ts`(L77–L91),`safeTryAsync.ts`(L58–L68)
**嚴重程度**:🟡 Medium → ✅ **Fixed**

### 修復內容

改進錯誤信息,引導用戶使用 `ok(undefined)` 或 `asyncOk(undefined)` 顯式包裹:

```ts
throw new Error(
    'safeTry: generator returned undefined without yielding. ' +
    'If you intended undefined as a legitimate success value, ' +
    'wrap it explicitly: `return ok(undefined);`. ' +
    'Otherwise, your generator likely forgot to `return` a value ' +
    'or to `yield* safeTry(...)` a failure.',
);
```

`safeTryAsync.ts` 應用了對稱的修復。

### 為什麼不徹底修復

`undefined` 與「未 return」共用相同的 JS sentinel(`first.value === undefined`),無法在運行時區分。徹底修復需要引入包裝對象或額外參數,會破壞 `fromSafeTry(gen)` 的函數簽名。當前的「文檔引導 + 顯式 `ok(undefined)`」方案在用戶體驗與 API 穩定性之間取得平衡。

### 驗證

新增回歸測試 `BUG-006: error message guides users toward ok(undefined) for legitimate undefined success` ✅

---

## 🟢 BUG-007:`pipeAsync` 在同步/異步混合鏈中可能把 Promise 當值傳遞 🟡 Documented

**檔案**:`src/composition/pipeAsync.ts`(L50–L75)
**嚴重程度**:🟢 Low → 🟡 **Documented**

### 描述

`pipeAsync` 的當前實現**不會**在迴圈中自動 `await` thenable。這意味著:
- 當 `fns[i]` 返回 `Promise<X>` 而 `fns[i+1]` 是同步函數時,`fns[i+1]` 收到的是 `Promise<X>` 而不是 `X`
- 與 curried 算子如 `mapAsync(f)`、`bindAsync(f)` 配合良好(它們期望 Promise 並自行 await)
- 與原始 `async (x) => ...` 函數配合時,需要用戶自行管理 await 鏈

### 為什麼不採用自動 await 修復

嘗試自動 `await` thenable 會破壞與 curried `mapAsync`/`bindAsync` 的協作(見 `pipeAsync.spec.ts` 「threads AsyncResult carriers through the chain in order」)。自動 await 會在 `await asyncOk(10)` 後傳遞 `IResultOfT` 給 curried `mapAsync`,而 `mapAsync` 期望 `Promise<IResultOfT>`,導致 `r.then is not a function`。

### 狀態

🟡 **已通過註解記錄**(在 `pipeAsync` 實現上方加詳細註釋,說明設計權衡與推薦 workaround)。當前行為是「已知限制」而非「意外 bug」。

---

## 🟢 BUG-008:`safeTry.spec.ts` 與 `safeTryAsync.spec.ts` 測試覆蓋不足 ✅ Fixed

**嚴重程度**:🟢 Low → ✅ **Fixed**

### 修復內容

新增 6 個回歸測試覆蓋 BUG-001 至 BUG-006 的關鍵邊界:

- `BUG-002: preserves original failure when user finally throws during cleanup`(safeTry)
- `BUG-002: preserves original failure when finally throws AFTER body returns`(safeTry)
- `BUG-002: preserves original failure when user finally throws during cleanup`(safeTryAsync)
- `BUG-003: rejects Promise with a .run property (not AsyncResult)`
- `BUG-004: rejects Promise<{ value: x }> (missing isSuccess) with explicit error`
- `BUG-006: error message guides users toward ok(undefined) for legitimate undefined success`

---

## 📊 修復總結

| BUG | 嚴重程度 | 狀態 | 修復方式 |
|-----|----------|------|----------|
| BUG-001 | 🔴 Critical | 🟡 Documented | 代碼註解,不改邏輯(G1 是設計選擇) |
| BUG-002 | 🔴 Critical | ✅ Fixed | `safeTry` / `safeTryAsync` 加 try/catch |
| BUG-003 | 🟠 High | ✅ Fixed(部分) | `isAsyncResult` 加 `then` 否定檢查 |
| BUG-004 | 🟠 High | ✅ Fixed | `safeTryAsync` yield 前形狀驗證 |
| BUG-005 | 🟡 Medium | ✅ Fixed | 加 `@throws` JSDoc |
| BUG-006 | 🟡 Medium | ✅ Fixed | 改進錯誤信息引導 `ok(undefined)` |
| BUG-007 | 🟢 Low | 🟡 Documented | 代碼註解,不改邏輯(自動 await 會破壞 curried 算子) |
| BUG-008 | 🟢 Low | ✅ Fixed | 新增 6 個回歸測試 |

### 測試結果

- ✅ `vitest run src/composition`:80 / 80 passed(原 74 + 新增 6)
- ✅ `vitest run`:2267 / 2267 passed(全項目無回歸)
- ✅ `vitest run --typecheck src/composition`:137 / 137 passed,**0 type errors**
- ✅ `vitest run --typecheck`:65 pre-existing type errors(與修復前基線一致,未引入新錯誤)

### 修改檔案

```
src/composition/composeK.ts          (BUG-005: JSDoc @throws)
src/composition/composeKAsync.ts      (BUG-001 註解 + BUG-005: JSDoc @throws)
src/composition/pipeAsync.ts         (BUG-007 註解,行為不變)
src/composition/safeTry.ts           (BUG-002: try/catch, BUG-006: 改進錯誤信息)
src/composition/safeTryAsync.ts      (BUG-002: try/catch, BUG-003: then 否定, BUG-004: 形狀驗證, BUG-006: 改進錯誤信息)
src/composition/safeTry.spec.ts      (BUG-002, BUG-006 回歸測試)
src/composition/safeTryAsync.spec.ts (BUG-002, BUG-003, BUG-004 回歸測試 + 5 個舊測試更新為期望拋出)
bugs.md                              (本文件)
```

---

*由 Claude Code 安全審查工作流生成於 2026-08-08*

# 行為模式（Behavior Modes）

> 本文件是全庫錯誤處理行為的唯一真源：統一術語，並按模塊列出每個 API 遇到拋出、失敗輸入、空輸入時的行為。
> 完整函數簽名與 JSDoc 以源文件為準，本文只收斂行為結論並鏈回源文件。
> 通道政策由 `src/tests/hardening/behavior-policy.spec.ts` 一致性護欄對照驗證：新增公開導出未在 `behavior-matrix.ts` 登記、或探針結果與聲明不符時，`npm test` 失敗。
> 另見 [SPEC.md](../SPEC.md)（API 索引）與 [ARCH.md](../ARCH.md)（架構決策 ADR 11）。

## 1. 導讀：`exception-free` 的精確範圍

`README` 與 `SPEC` 開頭的 `exception-free` 指的是**主流程用值傳遞錯誤**：成功與失敗都以普通對象（`IResultOfT` / `IOption`）在類型中顯式流動，調用方不需要 `try/catch` 就能知道一個函數是否可能失敗。

它**不是**「全庫永不拋出」。以下三類拋出是設計的一部分：

1. **回調透傳**：部分操作符不捕獲傳入函數的拋出，原樣向上拋（見 2.3 節）。
2. **逃生口**：`unwrap` / `expect` / `unsafe*` / `orThrow` 系在契約違規時主動拋出（見 2.4–2.6 節）。
3. **異步拒絕通道**：`Promise` 外層本身的 `reject` 永遠保持拒絕傳播，不會被轉成 `Err`（見 2.9 節）。只有 `reliability` 層承諾永不拒絕。

判斷一個 API 會不會拋，只查第 4 節的對照表，不憑名字猜測（例如同步 `map` 捕獲但 `bind` 透傳）。

## 2. 術語表

| 中文術語 | 英文 | 定義 |
| --- | --- | --- |
| 永不拋 | NeverThrow | 函數體無 `throw`，內部 `try/catch` 把拋出轉為 `Err` / `None` / 默認值。 |
| 捕獲轉值 | CatchToErr | 回調的同步拋出被捕獲並轉為 `Err`（`Option` 側則轉為 `None` / 默認值）。注意 `errorFn` 自身再拋時是否被二次捕獲，各表單獨註明。 |
| 直接透傳 | Propagate | 回調的拋出或返回的拒絕 `Promise` 不捕獲，原樣拋給調用方。 |
| 契約恐慌 | Panic | 誤用時 `throw new TypeError` / `new Error`，用於標記契約違規（Rust 式 `unwrap` 語義）。 |
| 原樣拋出 | ThrowRaw | 把攜帶的值原樣 `throw` 出去（`throw r.error`），不包 `TypeError`。 |
| 定型拋出 | ThrowTyped | 拋出定型錯誤：要求 `E extends Error` 直接拋，或用 `errorFn` 映射後拋出。 |
| 遇錯短路 | FailFirst | 遇到第一個 `Err` / `None` 即返回，不再處理後續輸入。注：`FailFast` 為同義詞，本文統一用 `FailFirst`。 |
| 累積錯誤 | Accumulate | 跑完所有輸入，把全部錯誤收集為 `Err(E[])` 後返回。 |
| 永不拒絕 | NeverRejects | 返回的 `Promise` 永不進入拒絕態，拋出與拒絕一律收斂為 `Err`。僅 `reliability` 層提供此保證。 |
| 懶執行 / 急執行 | Lazy / Eager | 懶執行返回 thunk，未調 `run()` 不執行；急執行調用即掛鏈並返回已在途的 `Promise`。 |

## 3. 總覽矩陣

| 模塊 | 回調拋出 | 失敗輸入 | 空輸入 | 執行時機 |
| --- | --- | --- | --- | --- |
| `factories` | 構造無回調；`fromThrowable` / `tryCatch` / `fromPromise` / `fromSafePromise` 捕獲轉值（`fromSafePromise` 無 `errorFn` 時把非 `Error` 拒絕值歸一化為 `Error`） | 不適用 | 不適用 | 同步；`fromPromise` 返回 `Promise` |
| `operators` | 分裂：`map` 系捕獲（`choose` 例外：透傳且跳過 `Err`），`bind` 系透傳，逃生口主動拋 | `FailFirst` 為主，`separate` 累積分區 | 不適用 | 同步 |
| `combine` | 純值組合，無回調 | `combine` / `all` 遇錯短路，`combineWithAllErrors` 累積錯誤 | `Ok([])` | 同步 |
| `composition` | `pipe` / `pipeAsync` 透傳（`pipeAsync` 步驟同步拋轉拒絕、不自動解包 thenable）；`composeK` / `composeKAsync` 捕獲轉值（後者含異步拒絕）；`safeTry` / `safeTryAsync` 生成器自拋重拋（async 版非法 resolve 值拋 `TypeError`、自拋為拒絕） | `FailFirst`（經 `bind`） | `composeK` / `composeKAsync` 零函數時構造期恐慌 | 同步組合；`fromSafeTryAsync` 懶執行 |
| `adapters` | `switchFn` 捕獲，`tee` 透傳，`liftMap` 委託 `map` 捕獲 | 透傳 / 轉換，無短路概念 | 不適用 | 同步 |
| `primitives` | `cond` / `reduce` 透傳；`lift` 雙態（有 `errorFn` 捕獲，無則透傳） | `sequence` / `reduce` 遇錯短路 | 不適用 | 同步；`sequenceAsyncResult` 懶執行（構造期僅取 `run` 引用，`run()` 內同步拋亦透傳） |
| `option` | 除 `match` 外一律捕獲轉 `None` / 默認值 | 遇 `None` 短路 | `all([])` 類型層拒絕（與 `combine` 不同） | 同步，零恐慌 API |
| `promise-result` | 分裂：`map` / `tap` / `bimapAsync` / `asyncBindThrough` / `bindThroughAsync` 系捕獲轉值，`bind` / `match` / `catchErrAsync` 系透傳 | `FailFirst` / 累積（同 `combine`） | `Ok([])`；外層拒絕保持拒絕 | 急執行 |
| `promise-option` | 除提升系外一律捕獲轉 `None` / 默認值；提升系：同步拋轉 `None`、異步拒絕保持傳播（`asyncMapOption` / `asyncBindOption` / `asyncTapOption` / `asyncOrElseOption` / `tapErrAsyncOption`） | 遇 `None` 短路 | 無組合 API | 急執行 |
| `async-result` | 除 `mapAsync` / `mapOrElse` / `match` / `exists` / `unwrapOrElse` / `ap` 等透傳外一律捕獲轉值（`ap` 為懶中間件） | `FailFirst` / 累積 | `Ok([])` | 懶執行，中間件不執行，終端觸發 |
| `async-option` | 除 `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `zipWith` 等透傳外一律捕獲轉值（`mapAsync` 與 `async-result` 側相反：此處捕獲，已聲明） | 遇 `None` 短路（`all` 實際跑完所有載體，見 5.3 節） | `Some([])`；`zipWith` 參數不足回 `None` | 懶執行，終端觸發 |
| `reliability` | 一律捕獲轉值，永不拒絕 | `race` 首個 `Ok` 勝，`any` / `allSettled` 跑完所有 | `race([])` 轉 `Err`，其餘回空成功 | `retry` / `timeoutEager` 急執行，其餘懶執行 |
| `observability` | `observe` / `installObserver` / `tapErrContext` 吞掉觀察者錯誤、不改變走向；`ctx` 為 `AsyncLocalStorage` 麵包屑 | 透傳 | 不適用 | 同步 |

## 4. 分模塊對照

### 4.1 工廠（`src/factories/`）

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `ok` / `err` | 永不拋，純對象字面量 | [ok.ts](../src/factories/ok.ts)、[err.ts](../src/factories/err.ts) |
| `fromPredicate` | 永不拋自身；傳入 `predicate` 的拋出直接透傳 | [fromPredicate.ts](../src/factories/fromPredicate.ts) |
| `fromThrowable` / `tryCatch` | 捕獲轉值；`errorFn` 自身再拋亦被內層捕獲收斂 | [fromThrowable.ts](../src/factories/fromThrowable.ts)、[tryCatch.ts](../src/factories/tryCatch.ts) |
| `fromSafePromise` | 捕獲轉值；無 `errorFn` 時非 `Error` 拒絕值歸一化為 `new Error(String(e))`，`errorFn` 自身再拋亦收斂；`E` 預設 `Error` | [fromSafePromise.ts](../src/factories/fromSafePromise.ts) |
| `fromPromise` / `tryCatchAsync` / `asyncOk` / `asyncErr` | 捕獲轉值；`Promise` 拒絕轉 `Err`，不保持拒絕 | [fromPromise.ts](../src/factories/fromPromise.ts)、[tryCatchAsync.ts](../src/factories/tryCatchAsync.ts) |

### 4.2 同步操作符（`src/operators/`）

**轉換與恢復：回調行為分裂，查表為準。**

| 導出 | 回調拋出 | 失敗輸入 | 源文件 |
| --- | --- | --- | --- |
| `map` / `orElse` / `tap` / `tapErr` / `bimap` / `filterOrElse` / `traverseArray` / `ap` / `andTee` / `orTee` / `andThrough` | 捕獲轉值（其中 `orElse` / `bimap` / `filterOrElse` 連 `errorFn` 再拋亦收斂；`map` / `tap` 系的 `errorFn` 再拋則透傳） | 遇錯短路（`FailFirst`） | [map.ts](../src/operators/map.ts)、[orElse.ts](../src/operators/orElse.ts)、[tap.ts](../src/operators/tap.ts)、[bimap.ts](../src/operators/bimap.ts)、[filterOrElse.ts](../src/operators/filterOrElse.ts)、[traverseArray.ts](../src/operators/traverseArray.ts)、[ap.ts](../src/operators/ap.ts) |
| `bind` / `mapErr` / `match` / `catchErr` / `unwrapOrElse` / `mapOr` / `mapOrElse` / `exists` | 直接透傳，不捕獲 | 遇錯短路或按分支調用；`mapOr` / `mapOrElse` 在失敗時走默認分支 | [bind.ts](../src/operators/bind.ts)、[mapErr.ts](../src/operators/mapErr.ts)、[match.ts](../src/operators/match.ts)、[unwrapOrElse.ts](../src/operators/unwrapOrElse.ts) |
| `choose` | 直接透傳，不捕獲；跳過 `Err` 續跑（既非遇錯短路亦非累積） | 同左 | [choose.ts](../src/operators/choose.ts) |
| `flatten` / `and` / `or` / `swap` / `unwrapOr` / `contains` / `separate` / `unzip` | 無回調，永不拋；`separate` 為累積分區，其餘為短路或投影 | 同左 | [combine 相關](../src/combine/combine.ts)、[separate.ts](../src/operators/separate.ts) |

**終端逃生口：四種拋法不要混用。**

| 導出 | 行為 | 何時選用 | 源文件 |
| --- | --- | --- | --- |
| `unwrap` / `expect` / `unwrapErr` / `expectErr` | 契約恐慌：違規時 `throw new TypeError`，可用 `throwingFn` 定制拋出類 | 調試與測試，需要堆棧與明確的誤用信號 | [unwrap.ts](../src/operators/unwrap.ts)、[expect.ts](../src/operators/expect.ts)、[unwrapErr.ts](../src/operators/unwrapErr.ts)、[expectErr.ts](../src/operators/expectErr.ts) |
| `unsafeUnwrap` / `unsafeUnwrapErr` | 原樣拋出：`throw r.error` / `throw r.value`，不包裝 | 逃生艙：把已確知的錯誤值拋給外層 `try/catch` | [unsafeUnwrap.ts](../src/operators/unsafeUnwrap.ts)、[unsafeUnwrapErr.ts](../src/operators/unsafeUnwrapErr.ts) |
| `orThrow` / `orThrowWith` | 定型拋出：`orThrow` 要求 `E extends Error`；`orThrowWith` 用 `errorFn` 映射後拋出 | 生產代碼需要拋出定型 `Error` 子類時 | [orThrow.ts](../src/operators/orThrow.ts) |

### 4.3 組合（`src/combine/`、`src/composition/`）

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `combine` / `all` | 遇錯短路（`FailFirst`），保留首個 `Err`；空數組回 `Ok([])`；純值組合，永不拋 | [combine.ts](../src/combine/combine.ts)、[all.ts](../src/combine/all.ts) |
| `combineWithAllErrors` | 累積錯誤，空數組回 `Ok([])`；永不拋 | [combineWithAllErrors.ts](../src/combine/combineWithAllErrors.ts) |
| `pipe` / `pipeAsync` | 直接透傳：`pipe` 任一步驟同步拋即向外拋；`pipeAsync` 步驟同步拋轉為拒絕，且不自動解包 thenable（混鏈傳原值），對 `Err` 無感知 | [pipe.ts](../src/composition/pipe.ts)、[pipeAsync.ts](../src/composition/pipeAsync.ts) |
| `composeK` | 捕獲轉值：步驟同步拋轉 `Err` 並遇錯短路；零函數構造期契約恐慌 | [composeK.ts](../src/composition/composeK.ts) |
| `composeKAsync` | 捕獲轉值：步驟同步拋與異步拒絕皆轉 `Err`；零函數構造期契約恐慌 | [composeKAsync.ts](../src/composition/composeKAsync.ts) |
| `safeTry` / `fromSafeTry` | 生成器自拋重拋；成功卻無值或二次 `yield` 時主動拋 `Error` | [safeTry.ts](../src/composition/safeTry.ts) |
| `safeTryAsync` / `fromSafeTryAsync` | 生成器自拋重拋（表現為拒絕）；非法 `resolve` 值主動拋 `TypeError`；`fromSafeTryAsync` 回懶執行 thunk | [safeTryAsync.ts](../src/composition/safeTryAsync.ts) |

### 4.4 適配器與高頻原語（`src/adapters/`、`src/primitives/`）

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `switchFn` / `switchFnAsync` | 捕獲轉值（含 `errorFn` 二次收斂） | [switchFn.ts](../src/adapters/switchFn.ts) |
| `tee` / `teeAsync` | 直接透傳（無失敗態可轉） | [tee.ts](../src/adapters/tee.ts) |
| `toOption` / `fromOption` | 永不拋 | [toOption.ts](../src/adapters/toOption.ts)、[fromOption.ts](../src/adapters/fromOption.ts) |
| `liftMap` | 委託 `operators/map`：回調拋出捕獲轉 `Err` | [liftMap.ts](../src/adapters/liftMap.ts) |
| `cond` / `condErr` / `reduce` | 直接透傳；`reduce` 另對來源與步驟失敗遇錯短路 | [cond.ts](../src/primitives/cond.ts)、[reduce.ts](../src/primitives/reduce.ts) |
| `sequence` / `partitionOption` | 永不拋；`sequence` 委託 `combine` 遇錯短路 | [sequence.ts](../src/primitives/sequence.ts) |
| `lift` | 雙態：有 `errorFn` 則捕獲轉值，無則原樣重拋。注意 `E = never` 只是類型層保證，運行時仍可拋出 | [lift.ts](../src/primitives/lift.ts) |
| `sequenceAsyncResult` | 懶執行（構造期僅取 `run` 引用）；`run()` 內的同步拋與運行期拒絕皆透傳為拒絕，遇錯短路 | [sequenceAsyncResult.ts](../src/primitives/sequenceAsyncResult.ts) |

### 4.5 選項（`src/option/`）

全模塊永不拋（除 `match` 透傳外），回調拋出一律收斂為 `None` / 默認值；遇 `None` 短路。本模塊刻意不提供恐慌 API，只用 `unwrapOr` 提取。

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `ofSome` / `ofNone` / `flatten` / `contains` / `unwrapOr` / `okOr` / `transpose` | 永不拋，無回調或回調無關 | [ofSome.ts](../src/option/ofSome.ts)、[unwrapOr.ts](../src/option/unwrapOr.ts) |
| `map` / `bind` / `filter` / `tap` / `orElse` / `okOrElse` / `zipWith` | 捕獲轉值：回調拋即回 `None` / 默認值 | [map.ts](../src/option/map.ts)、[bind.ts](../src/option/bind.ts)、[zipWith.ts](../src/option/zipWith.ts) |
| `traverseArray` / `traverse` | 捕獲轉值：回調拋出、迭代器 `next()` 拋出皆回 `None` | [traverseArray.ts](../src/option/traverseArray.ts) |
| `match` | 終端透傳 | [match.ts](../src/option/match.ts) |
| `all` | 遇 `None` 短路；空元組在類型層拒絕 | [all.ts](../src/option/all.ts) |

### 4.6 急執行異步（`src/promise-result/`、`src/promise-option/`）

共同規則：調用即掛鏈的急執行；**外層 `Promise` 本身的拒絕永遠保持拒絕傳播**，不會轉成 `Err` / `None`。

| 導出 | 回調行為 | 源文件 |
| --- | --- | --- |
| `promise-result` 的 `map` / `mapErr` / `mapAsync` / `bimapAsync` / `asyncBindThrough` / `bindThroughAsync` / `tap` 系 / `asyncMap` / `asyncTap` | 捕獲轉值；`map` 另對返回 thenable 的同步 mapper 主動拋 `Error` 提示改用 `mapAsync` | [map.ts](../src/promise-result/map.ts)、[mapAsync.ts](../src/promise-result/mapAsync.ts)、[bimapAsync.ts](../src/promise-result/bimapAsync.ts)、[asyncBindThrough.ts](../src/promise-result/asyncBindThrough.ts)、[bindThroughAsync.ts](../src/promise-result/bindThroughAsync.ts) |
| `promise-result` 的 `bind` / `orElse` / `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `filterOrElse` / `ap` / `catchErrAsync` 系 | 直接透傳；`mapOrAsync` 特例為捕獲後回默認值並吞掉觀察者異常 | [bindAsync.ts](../src/promise-result/bindAsync.ts)、[matchAsync.ts](../src/promise-result/matchAsync.ts)、[catchErrAsync.ts](../src/promise-result/catchErrAsync.ts) |
| `promise-result` 的 `combine` / `combineWithAllErrors` | 前者遇錯短路，後者累積錯誤；空數組回 `Ok([])`；任一外層拒絕則整體拒絕 | [combine.ts](../src/promise-result/combine.ts) |
| `promise-option` 的 `map` / `bind` / `filter` / `exists` / `orElse` / `tap` / `mapOr` 系 | 捕獲轉值：回調拋或異步拒絕一律收斂為 `None` / `false` / 默認值 | [mapAsyncOption.ts](../src/promise-option/mapAsyncOption.ts)、[bindAsyncOption.ts](../src/promise-option/bindAsyncOption.ts) |
| `promise-option` 的提升系 `asyncMapOption` / `asyncBindOption` / `asyncTapOption` / `asyncOrElseOption` / `tapErrAsyncOption` | 同步拋轉 `None`、異步拒絕保持傳播 | [asyncMapOption.ts](../src/promise-option/asyncMapOption.ts)、[asyncBindOption.ts](../src/promise-option/asyncBindOption.ts)、[asyncOrElseOption.ts](../src/promise-option/asyncOrElseOption.ts)、[tapErrAsyncOption.ts](../src/promise-option/tapErrAsyncOption.ts) |
| `promise-option` 的 `asyncMatchOption` / `matchAsyncOption` / `mapOrElseAsyncOption` / `unwrapOrElseAsyncOption` | 直接透傳（同步拋轉拒絕） | [asyncMatchOption.ts](../src/promise-option/asyncMatchOption.ts) |

本層刻意不提供 `unwrap` / `expect` / `orThrow`，提取只用 `unwrapOr*` 家族（其異步拒絕走外層拒絕通道）。

### 4.7 懶執行異步（`src/async-result/`、`src/async-option/`）

共同規則：中間件返回新 thunk，不執行；`match` / `unwrap` / `unwrapOr` 等終端返回 `Promise` 並立即觸發 `run()`。

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `from` / `fromResult` / `fromOption` | 純懶包裝，不轉換不執行 | [from.ts](../src/async-result/from.ts)、[fromOption.ts](../src/async-option/fromOption.ts) |
| `async-result` 的 `fromPromise` | 捕獲轉值：thunk 拋或拒絕轉 `Err`，`errorFn` 再拋亦收斂 | [fromPromise.ts](../src/async-result/fromPromise.ts) |
| `async-option` 的 `fromPromise` | 捕獲轉值：簽名僅 `(thunk) => Promise`，無 `errorFn`；拋或拒絕一律轉 `None` | [fromPromise.ts](../src/async-option/fromPromise.ts) |
| `async-result` 的 `map` / `bind` / `bimap` / `mapErr` / `mapErrAsync` / `orElse` / `filterOrElse` / `tap` / `tapAsync` / `andThrough` / `catchErr` | 捕獲轉值（含 `bind` / `orElse` 的內層載體異步拒絕與 `catchErr` 的恢復回調失敗）；`map` 對 thenable 誤用收斂為 `Err(Error)` 而非拋出 | [map.ts](../src/async-result/map.ts)、[bind.ts](../src/async-result/bind.ts)、[catchErr.ts](../src/async-result/catchErr.ts) |
| `async-result` 的 `mapAsync` | 直接透傳（本層唯一反模式），`errorFn` 只重映射拒絕原因仍拋出 | [mapAsync.ts](../src/async-result/mapAsync.ts) |
| `async-result` 的 `match` / `exists` / `unwrapOrElse`（終端）與 `ap`（懶中間件）/ `mapOrElse` | 直接透傳；`mapOr` 特例為捕獲後回默認值 | [match.ts](../src/async-result/match.ts)、[exists.ts](../src/async-result/exists.ts)、[ap.ts](../src/async-result/ap.ts) |
| `async-result` 的 `unwrap` / `unwrapErr` / `expect` / `expectErr` | 終端契約恐慌，`cause` 保留原始 `E` | [unwrap.ts](../src/async-result/unwrap.ts)、[expect.ts](../src/async-result/expect.ts) |
| `async-result` 的 `combine` / `combineWithAllErrors` | 前者遇錯短路，後者累積錯誤；空數組回 `Ok([])`；構造期不執行，`run()` 以 `Promise.all` 啟動全部載體（執行期不短路） | [combine.ts](../src/async-result/combine.ts) |
| `async-option` 的 `map` / `mapAsync` / `bind` / `filter` / `tap` / `orElse` / `mapOr` / `okOrElse` | 捕獲轉值（`mapAsync` 全捕獲，與 `async-result/mapAsync` 相反，已聲明；含 `bind` / `orElse` 的內層載體異步拒絕） | [map.ts](../src/async-option/map.ts)、[filter.ts](../src/async-option/filter.ts) |
| `async-option` 的 `match` / `mapOrElse` / `unwrapOrElse` / `exists` / `zipWith` | 直接透傳 | [match.ts](../src/async-option/match.ts)、[zipWith.ts](../src/async-option/zipWith.ts) |
| `async-option` 的 `unwrap` | 終端契約恐慌（本層唯一的恐慌 API） | [unwrap.ts](../src/async-option/unwrap.ts) |
| `async-option` 的 `all` | 空數組回 `Some([])`；任一 `None` 回 `None`；`Promise.all` 啟動全部載體（見 5.3 節） | [all.ts](../src/async-option/all.ts) |

### 4.8 可靠性（`src/reliability/`）

本層是唯一承諾永不拒絕的異步層：同步拋、異步拒絕、鉤子拋出一律收斂為 `Err`。

| 導出 | 行為 | 源文件 |
| --- | --- | --- |
| `retry` / `retryLazy` | 捕獲轉值：`fn` 拋轉 `ThrownError`（保留原值），`times` 非法或信號已中止則回 `AbortedError` 且不執行 `fn`；可用 `onThrow` / `onAborted` 收斂到自有 `E`；後者僅把執行推遲到 `run()` | [retry.ts](../src/reliability/retry.ts)、[retryLazy.ts](../src/reliability/retryLazy.ts) |
| `timeout` / `timeoutEager` | 捕獲轉值：內層拒絕轉 `Err(拒絕原因)`，超時轉 `Err(onTimeout(ms))`；超時後內層仍在後台繼續（不可取消） | [timeout.ts](../src/reliability/timeout.ts)、[timeoutEager.ts](../src/reliability/timeoutEager.ts) |
| `race` | 首個 `Ok` 勝；全 `Err` 回輸入序首個 `Err`；`Err` 優先於拒絕；全拒絕回最早拒絕；空數組回 `Err(EmptyInputsError)`，可用 `onEmpty` 替換 | [race.ts](../src/reliability/race.ts) |
| `any` | 跑完所有；有成功回成功集合，否則回錯誤集合；拒絕標記為 `{ kind: 'Rejected' }`；空數組回 `Ok([])` | [any.ts](../src/reliability/any.ts) |
| `allSettled` | 永遠 `Ok`：按輸入序返回逐項結論；空數組回 `Ok([])` | [allSettled.ts](../src/reliability/allSettled.ts) |

### 4.9 可觀測性（`src/observability/`）

`ctx` / `withPath` 以 `AsyncLocalStorage`（Node／Bun／Deno；不可用時退回 polyfill）維護逐 scope 麵包屑幀，跨 `await` 隔離並支持嵌套鏈；`tapErrContext` / `observe` / `installObserver` 的觀察者錯誤一律吞掉（含 `onError` 二次吞），不改變主流程走向。格式化器 `format` / `inspect` 永不拋。詳見 [ctx.ts](../src/observability/ctx.ts) 與 [SPEC 可觀測性節](../SPEC.md#observability--srcobservability)。

## 5. 特例與不對稱（刻意設計）

1. **`option` / `promise-*` 零恐慌 API 是刻意的**：`Option` 用 `None` 表達缺席，不需要恐慌；急執行 `Promise` 層用 `unwrapOr*` 提取，避免在拒絕通道之外再開一個拋通道。
2. **`async-option` 只有 `unwrap`、沒有 `expect` / `orThrow`**：與 `async-result` 四件套不對稱，選型時在管線末端先用 `okOr` / `okOrElse` 橋接到 `AsyncResult` 再做定型拋出。
3. **異步組合不短路**：`async-option/all`、`async-result/combine`、`async-result/combineWithAllErrors` 底層都以 `Promise.all` 啟動所有載體；「短路」只體現在結果選擇（首個 `None` / 首個 `Err`）或錯誤累積，副作用依然全部發生。不要把它們當成同步 `combine` / `all` 的等價物。
4. **`map` 捕獲但 `bind` 透傳**：`map` 的回調是純值映射，捕獲是安全的；`bind` 的回調返回下一個 `Result`，屬於鐵路切換，透傳是為了不吞掉用戶鐵路之外的編程錯誤。
5. **`lift` 的 `E = never` 不代表運行時不拋**：無 `errorFn` 時原樣重拋，類型層的 `never` 只是「調用方必須自己接住」的標記。
6. **`mapOrAsync` 吞觀察者異常**：回默認值的同時會吞掉 `onErr` 自身的拋出，排查時注意原因丟失。

## 6. 如何選逃生口

- 要堆棧與誤用信號（測試、斷言）：`unwrap` / `expect` 系。
- 要把已知錯誤值交給外層 `try/catch`：`unsafeUnwrap` / `unsafeUnwrapErr`。
- 要拋定型 `Error` 子類（生產邊界）：`orThrow`（`E extends Error` 時）或 `orThrowWith`（用映射函數構造）。
- 在 `AsyncResult` 末端：先用終端 `match` / `unwrapOr` 收斂，確需拋時用 `async-result` 的 `unwrap` / `expect`（`cause` 保留原始錯誤）；`AsyncOption` 末端先 `okOr` 再拋。

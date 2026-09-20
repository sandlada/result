# bugs.md — 行為模式一致性審計記錄

> 來源：`docs/behavior-modes.md` 為真源，逐文件核對源碼 `try/catch`、`throw`、拒絕通道後記錄。
> 嚴重度：P0 運行時行為與真源規則或同層一致性矛盾（含未聲明的同層兄弟／鏡像分裂）；P1 文檔漏列、錯標（行為符合，或屬豁免層的可允許偏差）；P2 已聲明刻意，僅留選型痕跡。
> 風格判定：包裝層（`promise-result/`、`promise-option/`、`async-result/`、`async-option/`，與 `composition/` 的 `pipeAsync` / `composeKAsync` / `safeTryAsync` / `fromSafeTryAsync`）與轉換層（`adapters/`、`option/` 的 `okOr|okOrElse|transpose`、`factories/` 的 `fromPromise|fromSafePromise|tryCatchAsync|asyncOk|asyncErr`、`primitives/` 的 `lift|sequence|partitionOption`）允許與核心同步風格不同；跨層差異不單獨構成缺陷。真源契約矛盾、同層兄弟分裂、鏡像模組分裂仍計，除非真源明文聲明該不對稱（該 API 的偏差行為已明確列於真源表格者，視為已聲明）。
> 2026-09-20 全量核實（基線 `b6f6fc1`，Node v26.3.0，重建 `build/` 產物）：42 條逐條重跑原例與變體（同步拋／異步拒絕／`errorFn` 再拋／短路 vs 全啟動／懶急時序，共 110 項檢查，全數重現記錄所述行為）；4 條嚴重度重定（`factories/fromSafePromise`、`adapters/liftMap`、`async-result/ap`、`async-option/zipWith`）、7 條原例或機制修正（`async-result/mapOrElse`、`composition/pipeAsync`、`async-result/bind`、`async-result/orElse`、`async-option/bind`、`async-option/orElse`、`observability/ctx`）、另 2 條範例改為可示範機制（`async-result/combineWithAllErrors`、`async-option/all`）；文末核驗記錄已折入各條目，真源錯標／漏列已就地修正。
> 2026-09-20 修復波：20 條運行時缺陷已修（`option/traverseArray`、`option/traverse`、`async-result/catchErr`、`async-result/bind`、`async-result/orElse`、`async-result/andThrough`、`async-option/bind`、`async-option/orElse`、`promise-result/asyncBindThrough`、`promise-result/bindThroughAsync`、`promise-option/asyncOrElseOption`、`promise-option/tapErrAsyncOption`、`promise-option/asyncBindOption`、`promise-option/asyncTapOption`、`reliability/timeout`、`reliability/race`、`reliability/any`、`reliability/allSettled`、`observability/tapErrContext`、`observability/observe`）；4 條以真源明文聲明結案（`operators/choose`、`async-result/mapAsync`、`async-option/mapAsync`、`async-option/zipWith`）。防漂移護欄：`src/tests/hardening/behavior-matrix.ts` ＋ `behavior-policy.spec.ts`（55 個通道探針＋全公開導出分類守衛）。

### operators/choose
P0：同為 `fn:(a)=>IResultOfT` 的數組收集器，`choose` 回調拋出直接透傳，而兄弟 `traverseArray` 捕獲轉 `Err`；且 `choose` 跳過 `Err` 繼續收集，既非遇錯短路亦非累積錯誤，文檔 4.2 三表均未收錄。
```ts
import { choose, traverseArray } from '@sandlada/result/operators';
choose(() => { throw new Error('boom'); }, [1]); // 拋出 Error('boom')
traverseArray(() => { throw new Error('boom'); }, [1]); // 回 Err(Error('boom'))，不拋
```
> 核實（2026-09-20，`b6f6fc1`）：全數屬實。`choose` 同步拋 `Error('boom')`；`traverseArray` 同形回 `Err(Error('boom'))`；`[1, -2, 3]` 回 `[2, 6]`（跳過 `Err` 續跑）。文檔 4.2 三表確無 `choose`；核心層不享豁免。嚴重度不變（P0）；4.2 與 §3 總覽已就地補列。
> 處置（2026-09-20）：已聲明——純收集器無 `Err` 通道，透傳為設計限制；JSDoc 已補註記，結案。

### option/traverseArray
P0：與同模塊 `map`/`bind`/`filter`/`tap`/`orElse`/`zipWith`（一律捕獲轉 `None`）矛盾；`traverseArray` 回調拋出直接透傳。文檔表頭稱除 `match` 外一律捕獲，表格卻標本 API 透傳。
```ts
import { traverseArray, map, ofSome } from '@sandlada/result/option';
map((x: number) => { throw new Error('boom'); })(ofSome(1)); // 回 None，不拋
traverseArray((x: number) => { throw new Error('boom'); }, [1]); // 拋出 Error('boom')
```
> 核實：屬實。`traverseArray` 拋 `Error('boom')`，同情境 `map` 回 `None`。真源 4.5 表頭與表格互相矛盾已就地修正（表頭明列 `traverseArray`/`traverse` 例外）。P0 保留（核心層同模組分裂未解）。
> 處置（2026-09-20）：已修復——改為捕獲（回調與迭代器拋出皆轉 `None`）；真源 §3/§4.5 已改回「除 `match` 外一律捕獲」；spec 補測。

### option/traverse
P0：與上條同文件第二個導出，同樣透傳（`for...of` 上 `fn(a)` 裸調，連 throwing generator 的 `next()` 拋出亦透傳），與模塊主模式矛盾。
```ts
import { traverse } from '@sandlada/result/option';
function* gen() { yield 1; }
traverse(() => { throw new Error('boom'); }, gen()); // 拋出 Error('boom')
```
> 核實：屬實。`fn` 拋出與 generator `next()` 拋出（實測 `Error('gen-boom')`）皆透傳。與上條同源，P0 保留。
> 處置（2026-09-20）：已修復——同上，迭代器 `next()` 拋出亦收斂為 `None`。

### factories/fromSafePromise
P1：文檔 4.1 無此行；實現同為捕獲，但無 `errorFn` 時把非 `Error` 拒絕值歸一化為 `new Error(String(e))`，而 `fromPromise` 原樣保留 `e as E`。轉換／提升層允許此分叉（JSDoc 已聲明 `E = Error` 預設），缺陷在於文檔漏列。
```ts
import { fromPromise, fromSafePromise } from '@sandlada/result/factories';
await fromPromise(Promise.reject(42)); // 回 Err(42)
await fromSafePromise(Promise.reject(42)); // 回 Err(Error('42'))，error instanceof Error === true
```
> 核實：屬實。`Err(42)` 與 `Err(Error("42"))` 皆重現；`errorFn` 自身再拋亦收斂。嚴重度由 P0 降 P1（跨層／轉換層分叉屬豁免，文檔漏列為實）；4.1 已就地補列。

### adapters/liftMap
P1：文檔 4.4 把 `liftMap` 與 `toOption`/`fromOption` 併為永不拋；實際委託 `operators/map`，回調拋出捕獲轉 `Err`（轉換層允許與核心風格不同，問題在分組錯標）。
```ts
import { liftMap } from '@sandlada/result/adapters';
import { ok } from '@sandlada/result/factories';
liftMap(() => { throw new Error('x'); }, ok(1)); // 回 Err(Error('x'))，可產 Err
```
> 核實：屬實。回 `Err(Error("x"))`。嚴重度由 P0 降 P1；4.4 與 §3 已就地拆列。

### async-result/catchErr
P0：本層中間件除 `mapAsync` 外一律捕獲，但 `catchErr` 經 `promise-result/catchErrAsync`（全程無 `try`）把 `onErr` 的同步拋／異步拒絕透傳為外層拒絕；同為恢復系的 `orElse`/`filterOrElse` 均捕獲轉 `Err`。文檔 4.7 完全漏列。
```ts
import { catchErr, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
await catchErr(async () => { throw new Error('rec-boom'); }, fromResult(err('e'))).run(); // 拒絕 Error('rec-boom')，非 Err
```
> 核實：屬實。同步拋與異步拒絕皆以拒絕傳播（`Error('rec-boom')`）。與 `orElse` 的同層分裂未解；4.7 與 §3 已就地補列為透傳。P0 保留。
> 處置（2026-09-20）：已修復——`onErr` 失敗收斂為 `Err(thrown)`（源載體拒絕仍透傳）；真源移回捕獲列；spec 補測。

### async-result/ap
P1：無 `try`，函數應用拋直接透傳為拒絕；與同步同名 `operators/ap`（捕獲轉 `Err`）相反——跨層差異屬包裝層豁免，不單獨構成缺陷；真缺陷是文檔 4.7 把它歸為終端，實際 `return { run }` 為懶執行的中間件。
```ts
import { ap, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await ap(fromResult(ok(() => { throw new Error('ap-boom'); })), fromResult(ok(1))).run(); // 拒絕 Error('ap-boom')
```
> 核實：屬實。包裝函數拋 `Error('ap-boom')` → 拒絕；`{ run }` 形狀確認為懶中間件（無 `.then`）。嚴重度由 P0 降 P1；4.7 已就地改列。

### async-result/bind
P0：`fn` 自身拋／拒絕雖捕獲，但 `fn` 返回的內層載體以 `return next.run()`（在 `try` 內、未 `await`）直接返回：內層載體的同步拋仍被 `try` 收斂為 `Err`，異步拒絕則逃逸為外層拒絕；同形狀的 `andThrough` 用 `await` 收斂，形成同模組分裂。
```ts
import { bind, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await bind(() => bad as never, fromResult(ok(1))).run(); // 拒絕 Error('inner-reject')
```
> 核實：屬實（成因修正）。內層載體異步拒絕 → 拒絕 `Error('inner-reject')`；內層載體同步拋 → `Err(Error('inner-sync'))`；`fn` 自身拒絕 → `Err(Error('fn-reject'))`。原記錄「在 try 外」不精確，已就地更正。P0 保留。
> 處置（2026-09-20）：已修復——`next.run()` 改為 `await`，內層載體異步拒絕收斂為 `Err`；與 `andThrough` 對齊；spec 補測。

### async-result/orElse
P0：與上條同根因，`return next.run()` 未 `await`，內層載體異步拒絕透傳、同步拋收斂；`andThrough` 則兩者皆收斂。
```ts
import { orElse, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await orElse(() => bad as never, fromResult(err('e'))).run(); // 拒絕 Error('inner-reject')
```
> 核實：屬實（成因同 `bind` 修正）。P0 保留。
> 處置（2026-09-20）：已修復——同 `bind`（`await` 內層載體）。

### async-result/andThrough
P0：上兩條的另一面，`await next.run()` 在 `try` 內，內層同步拋與異步拒絕皆收斂為 `Err`，與 `bind`/`orElse` 同為載體返回形狀卻語義相反。
```ts
import { andThrough, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await andThrough(() => bad as never, fromResult(ok(1))).run(); // 回 Err(Error('inner-reject'))，不拒絕
```
> 核實：屬實。內層異步拒絕 → `Err(Error('inner-reject'))`；同步拋 → `Err(Error('inner-sync'))`。缺陷記於 `bind`/`orElse` 的同層分裂；`andThrough` 本身與 4.7 一致。P0 保留（分裂未解）。
> 處置（2026-09-20）：已修復——分裂解除（`bind`/`orElse` 已對齊）；本 API 行為不變。

### async-option/bind
P0：與 `async-result/bind` 同根因，`return next.run()` 未 `await`：內層載體異步拒絕透傳，同步拋收斂為 `None`；`fn` 自身拋／拒絕亦捕獲轉 `None`。
```ts
import { bind, fromOption } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await bind(() => bad as never, fromOption(ofSome(1))).run(); // 拒絕 Error('inner-reject')
```
> 核實：屬實（成因修正）。內層載體同步拋 → `None`。P0 保留。
> 處置（2026-09-20）：已修復——`await` 內層載體；同步拋與異步拒絕皆收斂為 `None`。

### async-option/orElse
P0：與上條同根因，內層載體異步拒絕透傳、同步拋收斂；`fn()` 自身拋／拒絕捕獲轉 `None`。
```ts
import { orElse, fromOption } from '@sandlada/result/async-option';
import { ofNone } from '@sandlada/result/option';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await orElse(() => bad as never, fromOption(ofNone())).run(); // 拒絕 Error('inner-reject')
```
> 核實：屬實（成因修正）。P0 保留。
> 處置（2026-09-20）：已修復——同 `bind`（`await` 內層載體）。

### async-result/mapOrElse
P1：`mapOr` 有 `try` 捕獲回默認值，`mapOrElse` 全程無 `try` 雙分支透傳；文檔只寫前者特例，未說明後者（`async-option` 側同分裂但後者有列）。
```ts
import { mapOr, mapOrElse, fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
await mapOr('d', async () => { throw new Error('x'); }, fromResult(ok(1))); // 回 'd'
await mapOrElse(async () => { throw new Error('x'); }, async () => 'd', fromResult(err('e'))); // 拒絕 Error('x')
```
> 核實：屬實。簽名為 `mapOr(defaultValue, fn, ar)` 與 `mapOrElse(onErr, fn, ar)`；修正後兩行皆重現。原範例把參數順序寫反（`mapOr` 回的是被放進 `defaultValue` 槽的函式；`mapOrElse` 餵 `ok(1)` 走成功分支回 `'d'`），已就地更正。4.7 已補列 `mapOrElse`。P1 保留。

### async-result/mapAsync
P2（刻意，備查）：本層唯一反模式，直接透傳且 `errorFn` 只重映射拒絕原因仍拋出；同模塊 `map`/`mapErrAsync`/`tapAsync` 全捕獲，文檔稱唯一反模式但未列後者，易誤推所有 `*Async` 透傳。
```ts
import { mapAsync, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await mapAsync(() => { throw new Error('m-boom'); }, fromResult(ok(1))).run(); // 拒絕 Error('m-boom')
```
> 核實：屬實。同步拋與異步拒絕皆透傳；`errorFn` 只重映射拒絕原因（實測回 `Error('mapped')` 的拒絕）；`mapErrAsync`/`tapAsync` 確為全捕獲，4.7 已就地補列。P2 保留。
> 處置（2026-09-20）：已聲明——維持逃生口；真源明文列示為本層唯一反模式。

### async-option/mapAsync
P0：與同名 `async-result/mapAsync` 鏡像反轉：本文件 `try{ ofSome(await fn) }catch→None` 全捕獲，`async-result` 側全透傳；兩者皆為包裝層，跨層差異屬豁免，但鏡像模組同名 API 政策相反且真源未聲明該不對稱。
```ts
import { mapAsync as mapAsyncOpt, fromOption } from '@sandlada/result/async-option';
import { mapAsync as mapAsyncRes, fromResult } from '@sandlada/result/async-result';
import { ofSome } from '@sandlada/result/option';
import { ok } from '@sandlada/result/factories';
await mapAsyncOpt(async () => { throw new Error('x'); }, fromOption(ofSome(1))).run(); // 回 None
await mapAsyncRes(async () => { throw new Error('x'); }, fromResult(ok(1))).run(); // 拒絕 Error('x')
```
> 核實：屬實。拋與拒絕皆回 `None`；`async-result` 側拒絕。4.7 與 §3 已就地補列此鏡像不對稱。P0 保留（鏡像分裂）。
> 處置（2026-09-20）：已聲明——行為不變；鏡像不對稱由真源明文聲明，結案。

### async-option/zipWith
P2：文件內註釋明示不捕獲，`fn` 拋／拒絕透傳；與同模塊 `map`/`mapAsync`/`bind`/`filter` 捕獲不同，與同步 `option/zipWith` 跨層反轉（後者屬包裝層豁免）。真源 4.7 已列其透傳，但同層分裂與 `fn` 參數不足回 `None` 的分支宜留意。
```ts
import { zipWith, fromOption } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';
await zipWith(() => { throw new Error('z-boom'); }, fromOption(ofSome(1)), fromOption(ofSome(2))).run(); // 拒絕 Error('z-boom')
```
> 核實：屬實。`fn` 拋 → 拒絕 `Error('z-boom')`；含 `None` 入參 → `None`。嚴重度由 P0 降 P2（已列且跨層豁免；同層分裂保留痕跡）。
> 處置（2026-09-20）：已聲明——行為不變；真源已列其透傳。

### async-result/combine
P1：結果選擇雖為遇錯短路，但執行期 `Promise.all(results.map(a => a.run()))` 啟動全部載體，副作用全發生；文檔無對應註明（僅 5.3 對 `async-option/all` 註明），易誤作執行期短路。
```ts
import { combine, fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
let started = 0;
const slow = { run: async () => { started++; return err('e'); } };
await combine([fromResult(err('first')), slow as never]).run(); // 回首個 Err，但 started === 1（slow 已啟動）
```
> 核實：屬實。回首個 `Err('first')`，`started === 1`。4.7 與 5.3 已就地補註（含 `combineWithAllErrors`）。P1 保留。

### async-result/combineWithAllErrors
P1：同上，累積錯誤本身正確，但執行期同樣全啟動，文檔未註明。
```ts
import { combineWithAllErrors, fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
let started = 0;
const slow = { run: async () => { started++; return err('b'); } };
await combineWithAllErrors([fromResult(ok(1)), fromResult(err('a')), slow as never]).run();
// 回 Err(['a', 'b'])，且 started === 1（slow 已啟動；空數組回 Ok([])）
```
> 核實：屬實。非空例回 `Err(["a","b"])` 且 `started === 1`；`combineWithAllErrors([])` 回 `Ok([])`。原空數組例無法示範全啟動，已就地更換。P1 保留。

### async-option/all
P2（刻意，備查）：文檔 5.3 已註明不短路（`Promise.all` 全啟動，僅結果取首個 `None`），但仍與同步 `combine` 的執行期短路直覺矛盾，選型易踩。
```ts
import { all, fromOption } from '@sandlada/result/async-option';
import { ofSome, ofNone } from '@sandlada/result/option';
let started = 0;
const slow = { run: async () => { started++; return ofNone(); } };
await all([fromOption(ofSome(1)), slow as never]).run(); // 回 None，且 started === 1
await all([]).run(); // 回 Some([])
```
> 核實：屬實。含 `None` 例回 `None` 且 `started === 1`；空數組回 `Some([])`。原空數組例未能示範全啟動，已就地更換。P2 保留；5.3 已補上 `async-result/combine`／`combineWithAllErrors` 同註。

### promise-result/asyncBindThrough
P0：`try + .then(v=>ok, e=>err)` 雙通道捕獲轉 `Err`（含 `fn` 的同步拋與異步拒絕），而同家族 `bindThroughAsync` 無 `try` 直接 `await fn` 透傳；文檔 4.6 未收錄前者，且兩者同模組政策相反未聲明。
```ts
import { asyncBindThrough } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
await asyncBindThrough(async () => { throw new Error('boom'); }, ok(1)); // 回 Err(Error('boom'))
```
> 核實：屬實。`fn` 同步拋與拒絕皆回 `Err(Error('boom'))`。P0 保留（同模組分裂）；4.6 與 §3 已就地補列。
> 處置（2026-09-20）：已修復——分裂解除（`bindThroughAsync` 已改為捕獲）；真源已將兩者同列捕獲列。

### promise-result/bindThroughAsync
P0：上條的另一面，全透傳（同步拋經 `.then` 變拒絕，異步拒絕保持拒絕）。
```ts
import { bindThroughAsync, asyncOk } from '@sandlada/result/promise-result';
await bindThroughAsync(async () => { throw new Error('boom'); }, asyncOk(1)); // 拒絕 Error('boom')
```
> 核實：屬實。同步拋、`async` 拋、拒絕皆為外層拒絕 `Error('boom')`。P0 保留。
> 處置（2026-09-20）：已修復——`fn` 失敗改為收斂 `Err(thrown)`；spec 由「透傳」改鎖「捕獲」。

### promise-result/catchErrAsync
P1：實際全透傳且 JSDoc 自述透傳，但文檔 4.6 未收錄；作為唯一恢復卻不吞恢復失敗的逃生口，應單列否則被誤作 `tap` 系捕獲。
```ts
import { catchErrAsync, asyncErr } from '@sandlada/result/promise-result';
await catchErrAsync(async () => { throw new Error('rec-boom'); }, asyncErr('e')); // 拒絕 Error('rec-boom')
```
> 核實：屬實。同步拋與異步拒絕皆拒絕（`Error('rec-boom')`）。P1 保留；4.6 與 §3 已就地補列。

### promise-result/bimapAsync
P1：實際雙分支全捕獲（含 `await` 拒絕），但文檔 4.6 捕獲列與透傳列均未點名。
```ts
import { bimapAsync, asyncErr } from '@sandlada/result/promise-result';
await bimapAsync(async (x: number) => x, async (e: string) => { throw new Error('boom'); }, asyncErr('e')); // 回 Err(Error('boom'))
```
> 核實：屬實。失敗分支拋 → `Err(Error("boom"))`；成功分支拒絕 → `Err(Error("ok-boom"))`。P1 保留；4.6 與 §3 已就地補列。

### promise-option/asyncOrElseOption
P0：`Promise.resolve(undefined).then(f)` 無 `try`，同步拋與異步拒絕皆透傳為拒絕；同模組 `orElseAsyncOption` 是 `try→None` 全捕獲，真源「提升系」清單未收錄本 API，未聲明此分裂。
```ts
import { asyncOrElseOption } from '@sandlada/result/promise-option';
import { ofNone } from '@sandlada/result/option';
await asyncOrElseOption(async () => { throw new Error('boom'); }, ofNone()); // 拒絕 Error('boom')
```
> 核實：屬實。同步拋與異步拒絕皆拒絕 `Error('boom')`；`orElseAsyncOption` 同情境回 `None`。P0 保留；4.6 提升系行已就地改寫為三分並補列本 API。
> 處置（2026-09-20）：已修復——同步拋改為收斂 `None`；異步拒絕維持透傳；4.6 提升系行改寫為單一政策。

### promise-option/tapErrAsyncOption
P0：雙分支 `await fn`/`await noneFn` 無 `try`，同步拋與異步拒絕全透傳；同模組 `tapAsyncOption` 全捕獲、`promise-result/tapErrAsync` 全捕獲（跨層屬豁免），真源未收錄本 API。
```ts
import { tapErrAsyncOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await tapErrAsyncOption(async () => { throw new Error('boom'); }, Promise.resolve(ofSome(1))); // 拒絕 Error('boom')
```
> 核實：屬實。Some 分支的 `fn` 拋 → 拒絕；None 分支的 `fnNone` 拋 → 拒絕。P0 保留（同模組分裂）；4.6 已就地補列。
> 處置（2026-09-20）：已修復——同步拋收斂 `None`、異步拒絕透傳；spec 補測。

### promise-option/asyncBindOption
P0：`fn().then(inner=>inner, ()=>None)` 吞同步拋與異步拒絕轉 `None`，而同族 `asyncMapOption` 僅吞同步拋、異步拒絕保持傳播；文檔只點名後者，未收錄前者（同模組分裂未聲明）。
```ts
import { asyncBindOption, asyncMapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncBindOption(async () => { throw new Error('x'); }, ofSome(1)); // 回 None（吞）
await asyncMapOption(async () => { throw new Error('x'); }, ofSome(1)); // 拒絕 Error('x')（傳播）
```
> 核實：屬實。同步拋與異步拒絕皆回 `None`。P0 保留；4.6 提升系行已就地改寫為三分並補列本 API。
> 處置（2026-09-20）：已修復——同步拋收斂 `None`；異步拒絕改為透傳；spec 更新。

### promise-option/asyncTapOption
P0：與上條同根因，同步拋與異步拒絕皆吞為 `None`，與 `asyncMapOption` 混合語義分裂。
```ts
import { asyncTapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncTapOption(async () => { throw new Error('x'); }, ofSome(1)); // 回 None（吞）
```
> 核實：屬實。同步拋與異步拒絕皆回 `None`。P0 保留；4.6 已就地補列。
> 處置（2026-09-20）：已修復——同步拋收斂 `None`；異步拒絕改為透傳；spec 更新。

### promise-option/asyncMapOption
P1：同步拋轉 `None` 但異步拒絕保持傳播的混合語義本身與文檔一致，但易與同目錄 `asyncBindOption`/`asyncTapOption`（全吞）及 `asyncOrElseOption`/`tapErrAsyncOption`（全透傳）混淆，文檔應明確提升系三分。
```ts
import { asyncMapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncMapOption(() => { throw new Error('sync'); }, ofSome(1)); // 回 None
await asyncMapOption(async () => { throw new Error('async'); }, ofSome(1)); // 拒絕 Error('async')
```
> 核實：屬實。同步拋 → `None`；異步拒絕 → 拒絕 `Error('async')`。P1 保留；4.6 提升系行已就地改寫為三分。
> 處置（2026-09-20）：已處置——提升系統一為「同步拋→`None`、異步拒絕透傳」，4.6 已改寫為單一政策；本 API 行為不變。

### composition/composeKAsync
P1：文檔 4.3 僅 `composeK` 一行；`composeKAsync` 零函數同樣恐慌，且同步拋加異步拒絕雙收斂（同步版僅同步拋），源鏈缺失；與同步版差異屬包裝層豁免，文檔漏列為實。
```ts
import { composeKAsync } from '@sandlada/result/composition';
await composeKAsync(async () => { throw new Error('k-boom'); })(1); // 回 Err(Error('k-boom'))，不拒絕
```
> 核實：屬實。步驟同步拋與拒絕皆回 `Err(Error('k-boom'))`/`Err(Error('k-rej'))`；零函數構造期同步 `TypeError`。P1 保留；4.3 與 §3 已就地補列。

### composition/safeTryAsync
P1：文檔 4.3 無此行；新增非法 `resolve` 值 `throw TypeError`（同步版無），且自拋重拋為拒絕（同步版為同步拋），另 `fromSafeTryAsync` 回懶執行 thunk，與總覽同步組合矛盾。
```ts
import { safeTryAsync, fromSafeTryAsync } from '@sandlada/result/composition';
await fromSafeTryAsync(async function* () { yield* safeTryAsync(Promise.resolve({} as never)); return 1; }).run(); // 拒絕 TypeError，同步版無此分支
```
> 核實：屬實。`Promise.resolve({})` 非法值 → `run()` 拒絕 `TypeError`。P1 保留；4.3 與 §3 已就地補列。

### composition/fromSafeTryAsync
P1：與上條同文件，懶執行（未調 `run()` 不執行），文檔總覽稱 composition 為同步組合，應補行。
```ts
import { fromSafeTryAsync } from '@sandlada/result/composition';
const ar = fromSafeTryAsync(async function* () { return 1; }); // 構造期不執行，await ar.run() 才觸發
```
> 核實：屬實。構造期計數為 0，`run()` 後回 `Ok(1)`。P1 保留；已併入上條文檔修正。

### composition/pipeAsync
P1：`async` 簽名無 `try`，步驟同步拋變拒絕（非同步拋），且刻意不自動解包 `thenable`（混鏈傳原值），文檔僅一句透傳未區分通道。
```ts
import { pipeAsync } from '@sandlada/result/composition';
await pipeAsync(1, () => { throw new Error('boom'); }); // 拒絕 Error('boom')，非同步拋
```
> 核實：屬實。步驟拋 → 拒絕；跨鏈 `thenable` 以原值傳遞（實測下一步收到 `thenable`）。原範例 `pipeAsync(fn)(1)` 非合法呼叫（`pipeAsync` 非柯里化，實測 `TypeError: ... is not a function`），已就地更正。P1 保留；4.3 已就地補述通道差異。

### reliability/timeout
P0：違永不拒絕。`new Promise` 執行器內 `arRun()` 同步拋無 `try`，逃逸即外層拒絕；`onTimeout` 拋已防禦、內層拒絕已收斂，僅同步拋漏網（對比 `timeoutEager` 有防禦）。
```ts
import { timeout } from '@sandlada/result/reliability';
await timeout(50, { run: () => { throw new Error('sync-boom'); } }).run(); // 拒絕 Error('sync-boom')，非 Err
```
> 核實：屬實。同步拋 → 拒絕 `Error('sync-boom')`；異步拒絕 → `Err(Error('async-boom'))`；`onTimeout` 拋 → `Err(Error('ot-boom'))`；`timeoutEager` 同步拋 → `Err`。P0 保留（4.8 永不拒絕受損）。
> 處置（2026-09-20）：已修復——載體同步拋就近收斂為 `Err`；4.8 永不拒絕恢復成立；spec 補測。

### reliability/race
P0：兩處可拒絕，違永不拒絕。`onEmpty()` 裸調拋即拒絕；`run()` 同步拋發生在 `Promise.resolve(run())` 傳參求值，早於雙通道接管，且位於 `new Promise` 執行器內。
```ts
import { race } from '@sandlada/result/reliability';
await race([], () => { throw new Error('onEmpty-boom'); }).run(); // 拒絕 Error('onEmpty-boom')
await race([{ run: () => { throw new Error('inner-sync'); } }]).run(); // 拒絕 Error('inner-sync')
```
> 核實：屬實。`onEmpty` 拋 → 拒絕；空數組預設 → `Err({"kind":"EmptyInputs"})`；載體同步拋 → 拒絕 `Error('inner-sync')`；異步拒絕 → `Err(Error('rej'))`。P0 保留。
> 處置（2026-09-20）：已修復——`onEmpty` 拋與載體同步拋皆收斂為 `Err`（不拒絕）；spec 補測。

### reliability/any
P0：`runs.map(run => Promise.resolve(run()))` 在同步段執行，任一 `run()` 同步拋即 `async run` 拒絕，未進 `{ kind: 'Rejected' }` 標籤通道（該通道僅接異步拒絕）。
```ts
import { any } from '@sandlada/result/reliability';
await any([{ run: () => { throw 1; } }]).run(); // 拒絕 1，非 Err([...])
```
> 核實：屬實。同步拋 `1` → 拒絕 `1`；異步拒絕 → `Err([{kind:'Rejected',...}])`；有成功 → `Ok([1])`。P0 保留。
> 處置（2026-09-20）：已修復——載體同步拋改走 `{ kind: 'Rejected' }` 標籤通道；spec 補測。

### reliability/allSettled
P0：與上條同根因，同步拋逃逸，未進按輸入序 `Settled` 通道；文檔永遠 `Ok` 僅覆蓋異步拒絕。
```ts
import { allSettled } from '@sandlada/result/reliability';
await allSettled([{ run: () => { throw 1; } }]).run(); // 拒絕 1，非 Ok([...])
```
> 核實：屬實。同步拋 `1` → 拒絕 `1`；異步拒絕 → `Ok([{ok:false,kind:'Rejected',...}])`；輸入序保持。P0 保留。
> 處置（2026-09-20）：已修復——載體同步拋改走按輸入序的 `Rejected` 通道，永遠 `Ok`；spec 補測。

### observability/tapErrContext
P0：觀察者同步拋經 `async IIFE` 轉為拒絕透傳、異步拒絕透傳，一律不吞；與 `observe`（一律吞）對立，文檔 4.9 併為只做透傳觀察不改變走向。
```ts
import { tapErrContext } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';
await tapErrContext(() => { throw new Error('obs-boom'); }, err('e')); // 拒絕 Error('obs-boom')
```
> 核實：屬實。同步拋與異步拒絕皆拒絕 `Error('obs-boom')`。P0 保留（4.9 與 §3 已就地改寫）。
> 處置（2026-09-20）：已修復——觀察者拋出／拒絕一律吞掉，與 `observe` 統一；真源 §3/4.9 改回「不改變走向」；spec 改鎖吞。

### observability/observe
P0：上條的另一面，`try handler/catch 吞`加 `onError` 二次吞，觀察者再壞也不影響走向；與 `tapErrContext` 不吞對立。
```ts
import { observe, installObserver } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';
const dispose = installObserver(() => { throw new Error('handler-boom'); });
observe(err('e')); // 正常返回原 Err，不拋不拒絕
dispose();
```
> 核實：屬實。拋出的 handler 下 `observe(err('e'))` 正常回 `Err('e')`；`onError` 鉤子被呼叫且其自身拋亦吞。P0 保留（與 `tapErrContext` 的分裂未解）。
> 處置（2026-09-20）：已修復——分裂解除（`tapErrContext` 已對齊為吞）；本 API 行為不變。

### observability/ctx
P1：文檔 4.9 稱只維護同步面包屑棧，實際為 `AsyncLocalStorage` 跨 `await` 隔離加嵌套鏈；另有 hostile thenable 恐慌通道未列。
```ts
import { ctx, getPath } from '@sandlada/result/observability';
ctx.run(() => { throw new Error('x'); }); // 同步拋恢復幀後重拋，非吞；且 getPath() 跨 await 隔離，非同步棧
```
> 核實：屬實（範圍修正）。`ctx.run` 同步拋原樣重拋；`getPath()` 跨 `await` 回 `["a","b"]`、嵌套回 `["a","b"]`、並發隔離成立；hostile thenable 防禦僅存在於 `polyfillStore`（無 ALS 環境），Node v26 走 ALS 分支不觸發。P1 保留；4.9 已就地改寫。

### primitives/sequenceAsyncResult
P1：文檔僅運行期拒絕直接透傳，實際 `await run()` 的同步拋同樣透傳為拒絕；且構造期取引用與 `run()` 前不執行兩階段未拆。
```ts
import { sequenceAsyncResult } from '@sandlada/result/primitives';
const bad = { run: () => { throw new Error('sync'); } };
await sequenceAsyncResult([bad as never]).run(); // 拒絕 Error('sync')
```
> 核實：屬實。構造期計數 0；`run()` 時同步拋 → 拒絕 `Error('sync')`；首個 `Err` 短路（第二載體不執行）。P1 保留；4.4 與 §3 已就地補述。

### async-result/map
P1：文檔稱對 thenable 誤用主動拋 `Error`，實際 `throw new Error` 在 `try` 內被捕獲收斂為 `Err(Error)`，並非向調用方拋出。
```ts
import { map, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await map((() => Promise.resolve(1)) as never, fromResult(ok(1))).run(); // 回 Err(Error('map: mapper returned a thenable...'))
```
> 核實：屬實。mapper 回 thenable → `Err(Error('map: mapper returned a thenable...'))`；同步拋與 `errorFn` 再拋亦收斂 `Err`。P1 保留；4.7 已就地改詞。

### async-option/fromPromise
P1：文檔暗示兩側 `fromPromise` 皆有 `errorFn` 且再拋收斂，實際本側簽名僅 `(thunk)=>Promise` 無 `errorFn`。
```ts
import { fromPromise } from '@sandlada/result/async-option';
await fromPromise(async () => { throw new Error('x'); }).run(); // 回 None，無 errorFn 可傳
```
> 核實：屬實。`fromPromise.length === 1`；thunk 拋／拒絕 → `None`。P1 保留；4.7 已就地拆分兩側記述。

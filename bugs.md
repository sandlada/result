# bugs.md — 行為模式一致性審計記錄

> 來源：`docs/behavior-modes.md` 為真源，逐文件核對源碼 `try/catch`、`throw`、拒絕通道後記錄。
> P0 為運行時行為矛盾（已用 `build/` 產物執行驗證），P1 為文檔漏列/錯標，P2 為已聲明刻意但仍留痕（標 `（刻意，備查）`）。
> 2026-09-20 複核：逐條重跑全部 42 條範例，行為判定全部屬實；但 7 條的範例／機制描述需修正、2 條嚴重度可商榷 —— 詳見文末〈核驗記錄（2026-09-20）〉。

### operators/choose
P0：同為 `fn:(a)=>IResultOfT` 的數組收集器，`choose` 回調拋出直接透傳，而兄弟 `traverseArray` 捕獲轉 `Err`；且 `choose` 跳過 `Err` 繼續收集，既非遇錯短路亦非累積錯誤，文檔 4.2 三表均未收錄。
```ts
import { choose, traverseArray } from '@sandlada/result/operators';
choose(() => { throw new Error('boom'); }, [1]); // 拋出 Error('boom')
traverseArray(() => { throw new Error('boom'); }, [1]); // 回 Err(Error('boom'))，不拋
```

### option/traverseArray
P0：與同模塊 `map`/`bind`/`filter`/`tap`/`orElse`/`zipWith`（一律捕獲轉 `None`）矛盾；`traverseArray` 回調拋出直接透傳。文檔表頭稱除 `match` 外一律捕獲，表格卻標本 API 透傳。
```ts
import { traverseArray, map, ofSome } from '@sandlada/result/option';
map((x: number) => { throw new Error('boom'); })(ofSome(1)); // 回 None，不拋
traverseArray((x: number) => { throw new Error('boom'); }, [1]); // 拋出 Error('boom')
```

### option/traverse
P0：與上條同文件第二個導出，同樣透傳（`for...of` 上 `fn(a)` 裸調，連 throwing generator 的 `next()` 拋出亦透傳），與模塊主模式矛盾。
```ts
import { traverse } from '@sandlada/result/option';
function* gen() { yield 1; }
traverse(() => { throw new Error('boom'); }, gen()); // 拋出 Error('boom')
```

### factories/fromSafePromise
P0：文檔 4.1 無此行；實現雖同為捕獲，但無 `errorFn` 時把非 `Error` 拒絕值歸一化為 `new Error(String(e))`，而 `fromPromise` 原樣保留 `e as E`，同為工廠層行為分叉。
```ts
import { fromPromise, fromSafePromise } from '@sandlada/result/factories';
await fromPromise(Promise.reject(42)); // 回 Err(42)
await fromSafePromise(Promise.reject(42)); // 回 Err(Error('42'))，error instanceof Error === true
```

### adapters/liftMap
P0：文檔 4.4 把 `liftMap` 與 `toOption`/`fromOption` 併為永不拋；實際 `liftMap` 委託 `operators/map`，回調拋出捕獲轉 `Err`，是有回調捕獲語義而非無回調永不拋。
```ts
import { liftMap } from '@sandlada/result/adapters';
import { ok } from '@sandlada/result/factories';
liftMap(() => { throw new Error('x'); }, ok(1)); // 回 Err(Error('x'))，可產 Err
```

### async-result/catchErr
P0：本層中間件除 `mapAsync` 外一律捕獲，但 `catchErr` 經 `promise-result/catchErrAsync`（全程無 `try`）把 `onErr` 的同步拋/異步拒絕透傳為外層拒絕；同為恢復系的 `orElse`/`filterOrElse` 均捕獲轉 `Err`。文檔 4.7 完全漏列。
```ts
import { catchErr, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
await catchErr(async () => { throw new Error('rec-boom'); }, fromResult(err('e'))).run(); // 拒絕 Error('rec-boom')，非 Err
```

### async-result/ap
P0：無 `try`，函數應用拋直接透傳為拒絕，與同步同名 `operators/ap`（捕獲轉 `Err`）相反；且文檔 4.7 把它歸為終端，實際 `return { run }` 為懶執行的中間件。
```ts
import { ap, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await ap(fromResult(ok(() => { throw new Error('ap-boom'); })), fromResult(ok(1))).run(); // 拒絕 Error('ap-boom')
```

### async-result/bind
P0：`fn` 自身拋/拒絕雖捕獲，但 `fn` 返回的內層載體用 `return next.run()`（無 `await`，在 `try` 外）直接返回，內層拒絕透傳為外層拒絕；同形狀的 `andThrough` 卻用 `await` 在 `try` 內收斂為 `Err`。
```ts
import { bind, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await bind(() => bad as never, fromResult(ok(1))).run(); // 拒絕 Error('inner-reject')
```

### async-result/orElse
P0：與上條同根因，`return next.run()` 無 `await`，內層載體拒絕透傳；`andThrough` 則收斂。
```ts
import { orElse, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await orElse(() => bad as never, fromResult(err('e'))).run(); // 拒絕 Error('inner-reject')
```

### async-result/andThrough
P0：上兩條的另一面，`await next.run()` 在 `try` 內，內層拒絕被捕獲轉 `Err`，與 `bind`/`orElse` 同為載體返回形狀卻語義相反。
```ts
import { andThrough, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await andThrough(() => bad as never, fromResult(ok(1))).run(); // 回 Err(Error('inner-reject'))，不拒絕
```

### async-option/bind
P0：與 `async-result/bind` 同根因，`return next.run()` 無 `await`，內層載體拒絕透傳，而 `fn` 自身拋/拒絕捕獲轉 `None`。
```ts
import { bind, fromOption } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await bind(() => bad as never, fromOption(ofSome(1))).run(); // 拒絕 Error('inner-reject')
```

### async-option/orElse
P0：與上條同根因，內層載體拒絕透傳，`fn()` 自身拋/拒絕捕獲轉 `None`。
```ts
import { orElse, fromOption } from '@sandlada/result/async-option';
import { ofNone } from '@sandlada/result/option';
const bad = { run: () => Promise.reject(new Error('inner-reject')) };
await orElse(() => bad as never, fromOption(ofNone())).run(); // 拒絕 Error('inner-reject')
```

### async-result/mapOrElse
P1：`mapOr` 有 `try` 捕獲回默認值，`mapOrElse` 全程無 `try` 雙分支透傳；文檔只寫前者特例，未說明後者，`async-option` 側同分裂但後者有列。
```ts
import { mapOr, mapOrElse, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await mapOr(async () => { throw new Error('x'); }, 'd', fromResult(ok(1))); // 回 'd'
await mapOrElse(async () => { throw new Error('x'); }, async () => 'd', fromResult(ok(1))); // 拒絕 Error('x')
```

### async-result/mapAsync
P2（刻意，備查）：本層唯一反模式，直接透傳且 `errorFn` 只重映射拒絕原因仍拋出；同模塊 `map`/`mapErrAsync`/`tapAsync` 全捕獲，文檔稱唯一反模式但未列後者，易誤推所有 `*Async` 透傳。
```ts
import { mapAsync, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await mapAsync(() => { throw new Error('m-boom'); }, fromResult(ok(1))).run(); // 拒絕 Error('m-boom')
```

### async-option/mapAsync
P0：與同名 `async-result/mapAsync` 反轉，本文件 `try{ ofSome(await fn) }catch→None` 全捕獲；文檔 4.7 未單列，易踩跨層同名不同策。
```ts
import { mapAsync as mapAsyncOpt, fromOption } from '@sandlada/result/async-option';
import { mapAsync as mapAsyncRes, fromResult } from '@sandlada/result/async-result';
import { ofSome } from '@sandlada/result/option';
import { ok } from '@sandlada/result/factories';
await mapAsyncOpt(async () => { throw new Error('x'); }, fromOption(ofSome(1))).run(); // 回 None
await mapAsyncRes(async () => { throw new Error('x'); }, fromResult(ok(1))).run(); // 拒絕 Error('x')
```

### async-option/zipWith
P0：文件內註釋明示不捕獲，`fn` 拋/拒絕透傳，與同模塊 `map`/`mapAsync`/`bind`/`filter` 捕獲矛盾；另與同步 `option/zipWith`（捕獲）跨層反轉。
```ts
import { zipWith, fromOption } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';
await zipWith(() => { throw new Error('z-boom'); }, fromOption(ofSome(1)), fromOption(ofSome(2))).run(); // 拒絕 Error('z-boom')
```

### async-result/combine
P1：結果選擇雖為遇錯短路，但執行期 `Promise.all(aos.map(a => a.run()))` 啟動全部載體，副作用全發生；文檔無對應註明（僅 5.3 對 `async-option/all` 註明），易誤作執行期短路。
```ts
import { combine, fromResult } from '@sandlada/result/async-result';
import { ok, err } from '@sandlada/result/factories';
let started = 0;
const slow = { run: async () => { started++; return err('e'); } };
await combine([fromResult(err('first')), slow as never]).run(); // 回首個 Err，但 started === 1（slow 已啟動）
```

### async-result/combineWithAllErrors
P1：同上，累積錯誤本身正確，但執行期同樣全啟動，文檔未註明。
```ts
import { combineWithAllErrors, fromResult } from '@sandlada/result/async-result';
import { err } from '@sandlada/result/factories';
await combineWithAllErrors([]).run(); // 回 Ok([])，構造期不執行（懶），run 內全啟動
```

### async-option/all
P2（刻意，備查）：文檔 5.3 已註明不短路（`Promise.all` 全啟動，僅結果取首個 `None`），但仍與同步 `combine` 的執行期短路直覺矛盾，選型易踩。
```ts
import { all, fromOption } from '@sandlada/result/async-option';
import { ofSome } from '@sandlada/result/option';
await all([]).run(); // 回 Some([])，空數組不短路問題
```

### promise-result/asyncBindThrough
P0：`try + .then(v=>ok, e=>err)` 雙通道捕獲轉 `Err`，而同家族 `bindThroughAsync` 無 `try` 直接 `await fn` 透傳；文檔 4.6 未收錄前者，易誤以為皆透傳。
```ts
import { asyncBindThrough } from '@sandlada/result/promise-result';
import { ok } from '@sandlada/result/factories';
await asyncBindThrough(async () => { throw new Error('boom'); }, ok(1)); // 回 Err(Error('boom'))
```

### promise-result/bindThroughAsync
P0：上條的另一面，全透傳（同步拋經 `.then` 變拒絕，異步拒絕保持拒絕）。
```ts
import { bindThroughAsync, asyncOk } from '@sandlada/result/promise-result';
await bindThroughAsync(async () => { throw new Error('boom'); }, asyncOk(1)); // 拒絕 Error('boom')
```

### promise-result/catchErrAsync
P1：實際全透傳且 JSDoc 自述透傳，但文檔 4.6 未收錄；作為唯一恢復卻不吞恢復失敗的逃生口，應單列否則被誤作 `tap` 系捕獲。
```ts
import { catchErrAsync, asyncErr } from '@sandlada/result/promise-result';
await catchErrAsync(async () => { throw new Error('rec-boom'); }, asyncErr('e')); // 拒絕 Error('rec-boom')
```

### promise-result/bimapAsync
P1：實際雙分支全捕獲（含 `await` 拒絕），但文檔 4.6 捕獲列與透傳列均未點名。
```ts
import { bimapAsync, asyncErr } from '@sandlada/result/promise-result';
await bimapAsync(async (x: number) => x, async (e: string) => { throw new Error('boom'); }, asyncErr('e')); // 回 Err(Error('boom'))
```

### promise-option/asyncOrElseOption
P0：`Promise.resolve(undefined).then(f)` 無 `try`，同步/異步皆透傳為拒絕；對應 `orElseAsyncOption` 卻是 `try→None` 全捕獲，文檔稱 `orElse` 系捕獲未豁免提升系。
```ts
import { asyncOrElseOption } from '@sandlada/result/promise-option';
import { ofNone } from '@sandlada/result/option';
await asyncOrElseOption(async () => { throw new Error('boom'); }, ofNone()); // 拒絕 Error('boom')
```

### promise-option/tapErrAsyncOption
P0：雙分支 `await fn/await noneFn` 無 `try` 全透傳；對應 `tapAsyncOption` 全捕獲，`promise-result/tapErrAsync` 全捕獲，文檔稱 `tap` 系捕獲未豁免本 API。
```ts
import { tapErrAsyncOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await tapErrAsyncOption(async () => { throw new Error('boom'); }, Promise.resolve(ofSome(1))); // 拒絕 Error('boom')
```

### promise-option/asyncBindOption
P0：同為提升系，`fn().then(inner=>inner, ()=>None)` 吞異步拒絕轉 `None`，而 `asyncMapOption` 保留異步拒絕傳播；文檔只點名後者混合，對前者歸類缺失。
```ts
import { asyncBindOption, asyncMapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncBindOption(async () => { throw new Error('x'); }, ofSome(1)); // 回 None（吞）
await asyncMapOption(async () => { throw new Error('x'); }, ofSome(1)); // 拒絕 Error('x')（傳播）
```

### promise-option/asyncTapOption
P0：與上條同根因，全捕獲（含異步拒絕轉 `None`），與 `asyncMapOption` 混合語義分裂。
```ts
import { asyncTapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncTapOption(async () => { throw new Error('x'); }, ofSome(1)); // 回 None（吞）
```

### promise-option/asyncMapOption
P1：同步拋轉 `None` 但異步拒絕保持傳播的混合語義本身與文檔一致，但易與同目錄 `asyncBindOption`/`asyncTapOption`（全吞）混淆，建議文檔明確提升系內部分兩種。
```ts
import { asyncMapOption } from '@sandlada/result/promise-option';
import { ofSome } from '@sandlada/result/option';
await asyncMapOption(() => { throw new Error('sync'); }, ofSome(1)); // 回 None
await asyncMapOption(async () => { throw new Error('async'); }, ofSome(1)); // 拒絕 Error('async')
```

### composition/composeKAsync
P1：文檔 4.3 僅 `composeK` 一行；`composeKAsync` 零函數同樣恐慌，且同步拋加異步拒絕雙收斂（同步版僅同步拋），源鏈缺失。
```ts
import { composeKAsync } from '@sandlada/result/composition';
await composeKAsync(async () => { throw new Error('k-boom'); })(1); // 回 Err(Error('k-boom'))，不拒絕
```

### composition/safeTryAsync
P1：文檔 4.3 無此行；新增非法 `resolve` 值 `throw TypeError`（同步版無），且自拋重拋為拒絕（同步版為同步拋），另 `fromSafeTryAsync` 回懶執行 thunk，與總覽同步組合矛盾。
```ts
import { safeTryAsync, fromSafeTryAsync } from '@sandlada/result/composition';
await fromSafeTryAsync(async function* () { yield* safeTryAsync(Promise.resolve({} as never)); return 1; }).run(); // 拒絕 TypeError，同步版無此分支
```

### composition/fromSafeTryAsync
P1：與上條同文件，懶執行（未調 `run()` 不執行），文檔總覽稱 composition 為同步組合，應補行。
```ts
import { fromSafeTryAsync } from '@sandlada/result/composition';
const ar = fromSafeTryAsync(function* () { return 1; }); // 構造期不執行，await ar.run() 才觸發
```

### composition/pipeAsync
P1：`async` 簽名無 `try`，步驟同步拋變拒絕（非同步拋），且刻意不自動解包 `thenable`（混鏈傳原值），文檔僅一句透傳未區分通道。
```ts
import { pipeAsync } from '@sandlada/result/composition';
await pipeAsync((x: number) => { throw new Error('boom'); })(1); // 拒絕 Error('boom')，非同步拋
```

### reliability/timeout
P0：違永不拒絕。`new Promise` 執行器內 `arRun()` 同步拋無 `try`，逃逸即外層拒絕；`onTimeout` 拋已防禦、內層拒絕已收斂，僅同步拋漏網（對比 `timeoutEager` 有防禦）。
```ts
import { timeout } from '@sandlada/result/reliability';
await timeout(50, { run: () => { throw new Error('sync-boom'); } }).run(); // 拒絕 Error('sync-boom')，非 Err
```

### reliability/race
P0：兩處可拒絕违永不拒絕。`onEmpty()` 裸調拋即拒絕；`run()` 同步拋發生在 `Promise.resolve(run())` 傳參求值，早於雙通道接管，且位於 `new Promise` 執行器內。
```ts
import { race } from '@sandlada/result/reliability';
await race([], () => { throw new Error('onEmpty-boom'); }).run(); // 拒絕 Error('onEmpty-boom')
await race([{ run: () => { throw new Error('inner-sync'); } }]).run(); // 拒絕 Error('inner-sync')
```

### reliability/any
P0：`runs.map(run => Promise.resolve(run()))` 在同步段執行，任一 `run()` 同步拋即 `async run` 拒絕，未進 `{ kind: 'Rejected' }` 標籤通道（該通道僅接異步拒絕）。
```ts
import { any } from '@sandlada/result/reliability';
await any([{ run: () => { throw 1; } }]).run(); // 拒絕 1，非 Err([...])
```

### reliability/allSettled
P0：與上條同根因，同步拋逃逸，未進按輸入序 `Settled` 通道；文檔永遠 `Ok` 僅覆蓋異步拒絕。
```ts
import { allSettled } from '@sandlada/result/reliability';
await allSettled([{ run: () => { throw 1; } }]).run(); // 拒絕 1，非 Ok([...])
```

### observability/tapErrContext
P0：觀察者同步拋經 `async IIFE` 轉為拒絕透傳、異步拒絕透傳，一律不吞；與 `observe`（一律吞）對立，文檔併為只做透傳觀察不改變走向。
```ts
import { tapErrContext } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';
await tapErrContext(() => { throw new Error('obs-boom'); }, err('e')); // 拒絕 Error('obs-boom')
```

### observability/observe
P0：上條的另一面，`try handler/catch 吞`加 `onError` 二次吞，觀察者再壞也不影響走向；與 `tapErrContext` 不吞對立。
```ts
import { observe, installObserver } from '@sandlada/result/observability';
import { err } from '@sandlada/result/factories';
const dispose = installObserver(() => { throw new Error('handler-boom'); });
observe(err('e')); // 正常返回原 Err，不拋不拒絕
dispose();
```

### observability/ctx
P1：文檔稱只維護同步面包屑棧，實際為 `AsyncLocalStorage` 跨 `await` 隔離加嵌套鏈；另有 hostile thenable 恐慌通道未列。
```ts
import { ctx, getPath } from '@sandlada/result/observability';
ctx.run(() => { throw new Error('x'); }); // 同步拋恢復幀後重拋，非吞；且 getPath() 跨 await 隔離，非同步棧
```

### primitives/sequenceAsyncResult
P1：文檔僅運行期拒絕直接透傳，實際 `await run()` 的同步拋同樣透傳為拒絕；且構造期取引用與 `run()` 前不執行兩階段未拆。
```ts
import { sequenceAsyncResult } from '@sandlada/result/primitives';
const bad = { run: () => { throw new Error('sync'); } };
await sequenceAsyncResult([bad as never]).run(); // 拒絕 Error('sync')
```

### async-result/map
P1：文檔稱對 thenable 誤用主動拋 `Error`，實際 `throw new Error` 在 `try` 內被捕獲收斂為 `Err(Error)`，並非向調用方拋出。
```ts
import { map, fromResult } from '@sandlada/result/async-result';
import { ok } from '@sandlada/result/factories';
await map((() => Promise.resolve(1)) as never, fromResult(ok(1))).run(); // 回 Err(Error('map: mapper returned a thenable...'))
```

### async-option/fromPromise
P1：文檔暗示兩側 `fromPromise` 皆有 `errorFn` 且再拋收斂，實際本側簽名僅 `(thunk)=>Promise` 無 `errorFn`。
```ts
import { fromPromise } from '@sandlada/result/async-option';
await fromPromise(async () => { throw new Error('x'); }).run(); // 回 None，無 errorFn 可傳
```

---

## 核驗記錄（2026-09-20）

> 方法：逐檔重讀 `src/**` 實作，並以 `build/` 產物在 Node v26 以 `--input-type=module` 逐一執行本文件全部 42 條範例。
> 結論：**42 條的行為判定全部屬實**；其中 **7 條的範例或機制描述不成立**（判定對、示範錯），另有 **2 條嚴重度可商榷**。

### 一、判定統計

| 判定 | 條數 | 條目 |
| --- | --- | --- |
| 完全屬實（行為與範例皆可重現） | 33 | `operators/choose`、`option/traverseArray`、`option/traverse`、`factories/fromSafePromise`、`async-result/catchErr`、`async-result/ap`、`async-result/andThrough`、`async-result/mapAsync`、`async-option/mapAsync`、`async-option/zipWith`、`async-result/combine`、`async-option/all`、`promise-result/asyncBindThrough`、`promise-result/bindThroughAsync`、`promise-result/catchErrAsync`、`promise-result/bimapAsync`、`promise-option/asyncOrElseOption`、`promise-option/tapErrAsyncOption`、`promise-option/asyncBindOption`、`promise-option/asyncTapOption`、`promise-option/asyncMapOption`、`composition/composeKAsync`、`composition/safeTryAsync`、`composition/fromSafeTryAsync`、`reliability/timeout`、`reliability/race`、`reliability/any`、`reliability/allSettled`、`observability/tapErrContext`、`observability/observe`、`primitives/sequenceAsyncResult`、`async-result/map`、`async-option/fromPromise` |
| 結論屬實、範例／描述不成立 | 7 | `async-result/bind`、`async-result/orElse`、`async-result/mapOrElse`、`async-option/bind`、`async-option/orElse`、`composition/pipeAsync`、`observability/ctx` |
| 嚴重度可商榷 | 2 | `adapters/liftMap`、`async-result/combineWithAllErrors` |

### 二、反例與修正（判定不變，示範或成因更正）

#### async-result/mapOrElse — 範例的參數順序寫反
記錄原文：
```ts
await mapOr(async () => { throw new Error('x'); }, 'd', fromResult(ok(1))); // 回 'd'
await mapOrElse(async () => { throw new Error('x'); }, async () => 'd', fromResult(ok(1))); // 拒絕 Error('x')
```
實際簽名為 `mapOr(defaultValue, fn, ar)` 與 `mapOrElse(onErr, fn, ar)`。以 `build/` 執行：
- 第一行把 `fn` 放進了 `defaultValue` 槽，實際回傳的是那個函式（序列化為 `undefined`），不是 `'d'`。
- 第二行輸入是 `ok(1)`，走成功分支呼叫 `fn`，實際 resolve `'d'`。

修正後可重現結論：
```ts
await mapOr('d', async () => { throw new Error('x'); }, fromResult(ok(1))); // 回 'd'
await mapOrElse(async () => { throw new Error('x'); }, async () => 'd', fromResult(err('e'))); // 拒絕 Error('x')
```

#### composition/pipeAsync — 範例不是合法呼叫
`pipeAsync` 非 curried，簽名為 `pipeAsync(value, ...fns)`。記錄的 `pipeAsync((x) => { throw ... })(1)` 實際得到 `TypeError: pipeAsync(...) is not a function`。修正：
```ts
await pipeAsync(1, () => { throw new Error('boom'); }); // 拒絕 Error('boom')
```

#### async-result/bind、async-result/orElse、async-option/bind、async-option/orElse — 「在 try 外」不精確
`return next.run()` 其實**位於 `try` 區塊內**，只是沒有 `await`。因此：
- 內層載體 `run()` 同步拋 → 被捕捉，收斂為 `Err` / `None`（與 `andThrough` 相同）；
- 內層載體回傳的 Promise 異步拒絕 → 逃逸為外層拒絕。

實測 `bind(() => ({ run: () => { throw new Error('inner-sync'); } }), fromResult(ok(1))).run()` 回 `Err`，不拒絕。原記錄「內層拒絕透傳」的判定對，但成因須改為「未 `await`：同步拋仍被捕獲，僅異步拒絕逃逸」。

#### observability/ctx — hostile thenable 通道為 polyfill 專屬
記錄的「hostile thenable 恐慌通道」只存在於 `polyfillStore`（無 `AsyncLocalStorage` 的 runtime）。Node v26 走 ALS 分支，不讀 `.then`，該通道不觸發。跨 `await` 隔離與嵌套鏈已驗證成立：`ctx.run` 內 `await` 後 `getPath()` 回 `["outer","inner"]`，嵌套 `ctx.run` 回 `["a","b"]`。

### 三、嚴重度修訂

- `adapters/liftMap`：`liftMap` 自身永不拋（回調拋出被 `operators/map` 捕獲成 `Err`），文檔 4.4「永不拋」字面仍成立；真正的問題是把它與無回調的 `toOption` / `fromOption` 併在同一格。建議降為 P1（文檔分組不當），非 P0 矛盾。
- `async-result/combineWithAllErrors`：結論（執行期全啟動）成立，但範例用 `combineWithAllErrors([])` 空數組，無法示範「全啟動」；建議補非空且含失敗的範例。
- `factories/fromSafePromise`：行為分叉屬實，但其 JSDoc 已聲明 error type 預設 `Error`，可能為刻意；建議於記錄中註明。

### 四、文檔矛盾複核（仍成立）

- 4.5 表頭「除 `match` 外一律捕獲」與表格把 `traverseArray` / `traverse` 標成「直接透傳」自相矛盾。
- 4.7 把 `async-result/ap` 歸為「終端」（實為懶中間件），並漏列 `mapOrElse` / `catchErr` / `mapErrAsync` / `tapAsync`。
- 4.1 漏列 `fromSafePromise`；4.3 漏列 `composeKAsync` / `safeTryAsync` / `fromSafeTryAsync`。
- 4.6 漏列 `asyncBindThrough` / `bindThroughAsync` / `catchErrAsync` / `bimapAsync`，且未點名 `asyncOrElseOption` / `tapErrAsyncOption` 與 `asyncBindOption` / `asyncTapOption` 的歸類。
- 4.9 稱 `tapErrContext` / `ctx`「不改變拋行為、只維護同步棧」，與實作（可轉拒絕、`AsyncLocalStorage` 跨 `await`）不符。
- 5.3 只對 `async-option/all` 註明不短路，未提 `async-result/combine` / `combineWithAllErrors` 同樣全啟動。

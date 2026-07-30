# PromiseResult (異步結果管線)

`promise-result` 模組提供了針對 `Promise<IResultOfT<T, E>>` 的一系列操作符。這些函數不依賴於 AsyncResult 類別包裝，而是直接作用於原生 Promise，適合用於 `pipeAsync` 管線。

## API 列表

### 構造函數
- [`asyncErr`](../factories/asyncErr.ts): 快速創建處於 Err 狀態的 Promise。
- [`asyncOk`](../factories/asyncOk.ts): 快速創建處於 Ok 狀態的 Promise。

### 同步回調操作
- [`flatten`](./flatten.ts): 拍平。
- [`map`](./map.ts): 映射 Ok 狀態。
- [`mapErr`](./mapErr.ts): 映射 Err 狀態。
- [`unwrapOr`](./unwrapOr.ts): 解包或返回預設值。
- [`unwrapOrElse`](./unwrapOrElse.ts): 解包或執行回調。

### 異步回調操作
- [`bimapAsync`](./bimapAsync.ts): 異步雙向映射。
- [`bindAsync`](./bindAsync.ts): 異步鏈式綁定。
- [`bindThroughAsync`](./bindThroughAsync.ts): 異步鏈式傳遞並保持原值。
- [`containsAsync`](./containsAsync.ts): 異步包含檢查。
- [`existsAsync`](./existsAsync.ts): 異步條件檢查。
- [`filterOrElseAsync`](./filterOrElseAsync.ts): 異步過濾。
- [`flattenAsync`](./flattenAsync.ts): 異步拍平。
- [`mapAsync`](./mapAsync.ts): 異步映射 Ok。
- [`mapErrAsync`](./mapErrAsync.ts): 異步映射 Err。
- [`mapOrAsync`](./mapOrAsync.ts): 異步映射並提供預設值。
- [`mapOrElseAsync`](./mapOrElseAsync.ts): 異步分支映射。
- [`matchAsync`](./matchAsync.ts): 異步狀態匹配。
- [`orElseAsync`](./orElseAsync.ts): 異步回退操作。
- [`swapAsync`](./swapAsync.ts): 異步翻轉狀態。
- [`tapAsync`](./tapAsync.ts): 異步副作用 (Ok 狀態)。
- [`tapErrAsync`](./tapErrAsync.ts): 異步副作用 (Err 狀態)。
- [`unwrapOrAsync`](./unwrapOrAsync.ts): 異步解包預設值。
- [`unwrapOrElseAsync`](./unwrapOrElseAsync.ts): 異步解包回調生成。

### 提升操作 (同步 `IResultOfT` 配合異步回調)
- [`asyncBind`](./asyncBind.ts): 對同步 Result 執行異步綁定。
- [`asyncBindThrough`](./asyncBindThrough.ts): 對同步 Result 執行異步透傳綁定。
- [`asyncMap`](./asyncMap.ts): 對同步 Result 執行異步映射。
- [`asyncOrElse`](./asyncOrElse.ts): 對同步 Result 執行異步回退。
- [`asyncTap`](./asyncTap.ts): 對同步 Result 執行異步副作用 (Ok)。
- [`asyncTapErr`](./asyncTapErr.ts): 對同步 Result 執行異步副作用 (Err)。

### 組合與應用
- [`ap`](./ap.ts): 異步應用內部函數。
- [`combine`](./combine.ts): 短路式組合。
- [`combineWithAllErrors`](./combineWithAllErrors.ts): 聚合所有錯誤的組合。

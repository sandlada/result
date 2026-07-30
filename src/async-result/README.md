# AsyncResult (異步結果)

`async-result` 模組提供了對 `IResultOfT<T, E>` 的異步封裝（惰性 Thunk 模式），為異步流程控制、鐵路導向編程（ROP）及錯誤處理提供了強大的鏈式 API。

## API 列表

### 構造函數 (Constructors)
- [`from`](./from.ts): 從同步/異步函數創建 `AsyncResult`。
- [`fromPromise`](./fromPromise.ts): 將 `Promise<IResultOfT>` 轉換為 `AsyncResult`。
- [`fromResult`](./fromResult.ts): 將同步 `IResultOfT` 提升為 `AsyncResult`。

### 操作符 (Operators)
- [`and`](./and.ts): 若當前為 `Ok`，則返回另一個 `AsyncResult`。
- [`andTee`](./andTee.ts): 執行依賴於當前 `Ok` 值的異步副作用，若副作用成功則返回原值。
- [`andThrough`](./andThrough.ts): 執行鏈式操作，但保持原來的 `Ok` 值不變。
- [`ap`](./ap.ts): 應用 `AsyncResult` 內部包含的函數。
- [`bimap`](./bimap.ts): 同時轉換 `Ok` 與 `Err` 狀態的值。
- [`bind`](./bind.ts): 鏈式綁定，若當前為 `Ok` 則執行返回新 `AsyncResult` 的回調。
- [`combine`](./combine.ts): 組合多個 `AsyncResult`，遇到第一個 `Err` 即短路。
- [`combineWithAllErrors`](./combineWithAllErrors.ts): 組合多個 `AsyncResult`，並收集所有錯誤。
- [`contains`](./contains.ts): 檢查 `Ok` 是否包含指定值。
- [`containsErr`](./containsErr.ts): 檢查 `Err` 是否包含指定錯誤。
- [`exists`](./exists.ts): 檢查 `Ok` 中的值是否滿足指定條件。
- [`expect`](./expect.ts): 解包 `Ok` 的值，若為 `Err` 則拋出帶有自定義訊息的異常。
- [`expectErr`](./expectErr.ts): 解包 `Err` 的值，若為 `Ok` 則拋出帶有自定義訊息的異常。
- [`filterOrElse`](./filterOrElse.ts): 根據條件過濾 `Ok` 的值，若不滿足則轉為 `Err`。
- [`flatten`](./flatten.ts): 拍平嵌套的 `AsyncResult`。
- [`isErr`](./isErr.ts): 檢查是否為 `Err` 狀態。
- [`isOk`](./isOk.ts): 檢查是否為 `Ok` 狀態。
- [`map`](./map.ts): 轉換 `Ok` 狀態中的值（同步映射）。
- [`mapAsync`](./mapAsync.ts): 轉換 `Ok` 狀態中的值（異步映射）。
- [`mapErr`](./mapErr.ts): 轉換 `Err` 狀態中的值（同步映射）。
- [`mapErrAsync`](./mapErrAsync.ts): 轉換 `Err` 狀態中的值（異步映射）。
- [`mapOr`](./mapOr.ts): 轉換 `Ok` 中的值，若為 `Err` 則返回預設值。
- [`mapOrElse`](./mapOrElse.ts): 針對 `Ok` 與 `Err` 分別進行映射。
- [`match`](./match.ts): 針對 `Ok` 與 `Err` 分別執行回調並返回統一類型。
- [`or`](./or.ts): 若當前為 `Err`，則返回另一個 `AsyncResult`。
- [`orElse`](./orElse.ts): 若為 `Err`，則執行回調回退到新的 `AsyncResult`。
- [`orTee`](./orTee.ts): 若為 `Err` 則執行副作用，成功則保持原 `Err`，失敗則返回新錯誤。
- [`swapAsync`](./swapAsync.ts): 異步翻轉 `Ok` 與 `Err` 的狀態。
- [`tap`](./tap.ts): 針對 `Ok` 狀態執行同步副作用。
- [`tapAsync`](./tapAsync.ts): 針對 `Ok` 狀態執行異步副作用。
- [`tapErr`](./tapErr.ts): 針對 `Err` 狀態執行同步副作用。
- [`tapErrAsync`](./tapErrAsync.ts): 針對 `Err` 狀態執行異步副作用。
- [`unwrap`](./unwrap.ts): 解包 `Ok` 的值，若為 `Err` 則拋出異常。
- [`unwrapErr`](./unwrapErr.ts): 解包 `Err` 的值，若為 `Ok` 則拋出異常。
- [`unwrapOr`](./unwrapOr.ts): 解包 `Ok` 的值，若為 `Err` 則返回預設值。
- [`unwrapOrElse`](./unwrapOrElse.ts): 解包 `Ok` 的值，若為 `Err` 則執行回調生成預設值。

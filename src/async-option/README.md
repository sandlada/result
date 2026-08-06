# AsyncOption (異步可選值)

`async-option` 模組提供了對 `IOption<T>` 的異步封裝（惰性 Thunk 模式），支援鏈式調用與鐵路導向編程（ROP），專為需要延遲執行的異步可選值場景設計。

## API 列表

### 構造函數 (Constructors)
- [`from`](./from.ts): 從同步函數或值創建 `AsyncOption`。
- [`fromOption`](./fromOption.ts): 將同步的 `IOption` 提升為 `AsyncOption`。
- [`fromPromise`](./fromPromise.ts): 將返回 `IOption` 的 Promise 轉換為 `AsyncOption`。
- [`ofNone`](./ofNone.ts): 創建一個固定為 `None` 狀態的 `AsyncOption`。
- [`ofSome`](./ofSome.ts): 創建一個固定為 `Some` 狀態的 `AsyncOption`。

### 操作符 (Operators)
- [`all`](./all.ts): 組合多個 `AsyncOption`，若全部為 `Some` 則返回包含所有值的數組。
- [`bind`](./bind.ts): 鏈式綁定異步操作，若當前為 `Some` 則執行回調。
- [`contains`](./contains.ts): 檢查 `AsyncOption` 是否包含指定的值。
- [`exists`](./exists.ts): 檢查 `AsyncOption` 中的值是否滿足特定條件。
- [`filter`](./filter.ts): 若條件不滿足，則將 `Some` 轉換為 `None`。
- [`flatten`](./flatten.ts): 拍平嵌套的 `AsyncOption`。
- [`isNone`](./isNone.ts): 檢查是否為 `None` 狀態。
- [`isSome`](./isSome.ts): 檢查是否為 `Some` 狀態。
- [`map`](./map.ts): 轉換 `Some` 狀態中的值（同步映射）。
- [`mapAsync`](./mapAsync.ts): 轉換 `Some` 狀態中的值（異步映射）。
- [`mapOr`](./mapOr.ts): 轉換 `Some` 中的值，若為 `None` 則返回預設值。
- [`mapOrElse`](./mapOrElse.ts): 轉換 `Some` 中的值，若為 `None` 則執行回調返回預設值。
- [`match`](./match.ts): 針對 `Some` 與 `None` 狀態分別執行對應的回調分支。
- [`okOr`](./okOr.ts): 將 `AsyncOption` 轉換為 `AsyncResult`，若為 `None` 則使用提供的錯誤。
- [`okOrElse`](./okOrElse.ts): 將 `AsyncOption` 轉換為 `AsyncResult`，若為 `None` 則執行回調生成錯誤。
- [`orElse`](./orElse.ts): 若為 `None`，則回退到另一個 `AsyncOption`。
- [`tap`](./tap.ts): 針對 `Some` 狀態執行同步副作用。
- [`tapAsync`](./tapAsync.ts): 針對 `Some` 狀態執行異步副作用。
- [`transpose`](./transpose.ts): 翻轉 `AsyncOption` 內部結構（需視具體實現而定）。
- [`unwrap`](./unwrap.ts): 解包 `Some` 的值，若為 `None` 則拋出異常。
- [`unwrapOr`](./unwrapOr.ts): 解包 `Some` 的值，若為 `None` 則返回預設值。
- [`unwrapOrElse`](./unwrapOrElse.ts): 解包 `Some` 的值，若為 `None` 則執行回調生成預設值。
- [`zipWith`](./zipWith.ts): 將 N≥2 個 `AsyncOption` 的值進行組合（variadic；arity 2–10 顯式定義，>10 透過 mapped type 推導）。

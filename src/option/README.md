# Option (同步可選值)

`option` 模組提供了處理同步 `IOption<T>` 的操作符與構造函數，適用於表示可能缺失值的場景。

## API 列表

### 構造函數
- [`ofNone`](./ofNone.ts): 創建一個 `None` 實例。
- [`ofSome`](./ofSome.ts): 創建一個 `Some` 實例。

### 操作符
- [`all`](./all.ts): 組合多個 Option，全部為 `Some` 則返回值的數組。
- [`bind`](./bind.ts): 若為 `Some` 則執行回調返回新 Option（平坦化映射）。
- [`contains`](./contains.ts): 檢查 `Some` 是否包含指定值。
- [`filter`](./filter.ts): 若條件不滿足，則將 `Some` 轉為 `None`。
- [`flatten`](./flatten.ts): 拍平嵌套的 Option。
- [`map`](./map.ts): 映射 `Some` 中的值。
- [`match`](./match.ts): 對 `Some` 與 `None` 狀態分別執行回調。
- [`okOr`](./okOr.ts): 將 Option 轉為 Result，若為 `None` 則使用提供的錯誤。
- [`okOrElse`](./okOrElse.ts): 將 Option 轉為 Result，若為 `None` 則執行回調生成錯誤。
- [`orElse`](./orElse.ts): 若為 `None`，則回退到另一個 Option。
- [`tap`](./tap.ts): 對 `Some` 狀態執行同步副作用。
- [`transpose`](./transpose.ts): 轉換 Option 內部結構。
- [`unwrapOr`](./unwrapOr.ts): 解包 `Some`，若為 `None` 則返回預設值。
- [`zipWith`](./zipWith.ts): 組合 N≥2 個 Option 的值（variadic；arity 2–10 顯式定義，>10 透過 mapped type 推導）。

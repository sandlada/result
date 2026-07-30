# PromiseOption (異步可選值管線)

`promise-option` 模組提供了專門針對 `Promise<IOption<T>>` 的異步操作符。此模組對齊了 `promise-result` 的設計結構，但應用於 Option 類型。

## API 列表

### 構造函數
- [`asyncErr`](../factories/asyncErr.ts): 引入自 factories，創建異步 Err (作為 Option 的交互補充)。
- [`asyncOk`](../factories/asyncOk.ts): 引入自 factories，創建異步 Ok。
- [`ofNone`](../option/ofNone.ts): 創建同步 `None` 實例。
- [`ofSome`](../option/ofSome.ts): 創建同步 `Some` 實例。

### 操作符 (操作 `Promise<IOption>`)
- [`bindAsyncOption`](./bindAsyncOption.ts): 異步鏈式綁定。
- [`containsAsyncOption`](./containsAsyncOption.ts): 檢查是否包含特定值。
- [`existsAsyncOption`](./existsAsyncOption.ts): 檢查值是否滿足條件。
- [`filterAsyncOption`](./filterAsyncOption.ts): 異步過濾。
- [`flattenAsyncOption`](./flattenAsyncOption.ts): 拍平嵌套的異步 Option。
- [`mapAsyncOption`](./mapAsyncOption.ts): 異步映射。
- [`mapOrAsyncOption`](./mapOrAsyncOption.ts): 異步映射並提供預設值。
- [`mapOrElseAsyncOption`](./mapOrElseAsyncOption.ts): 異步分支映射。
- [`matchAsyncOption`](./matchAsyncOption.ts): 異步狀態匹配。
- [`orElseAsyncOption`](./orElseAsyncOption.ts): 異步回退操作。
- [`tapAsyncOption`](./tapAsyncOption.ts): 異步副作用 (Some 狀態)。
- [`tapErrAsyncOption`](./tapErrAsyncOption.ts): 異步副作用 (針對交互轉換場景)。
- [`unwrapOrAsyncOption`](./unwrapOrAsyncOption.ts): 解包或返回預設值。
- [`unwrapOrElseAsyncOption`](./unwrapOrElseAsyncOption.ts): 解包或異步生成預設值。

### 提升操作 (同步 `IOption` 配合異步回調)
- [`asyncBindOption`](./asyncBindOption.ts): 對同步 Option 執行異步綁定。
- [`asyncMapOption`](./asyncMapOption.ts): 對同步 Option 執行異步映射。
- [`asyncMatchOption`](./asyncMatchOption.ts): 對同步 Option 執行異步狀態匹配。
- [`asyncOrElseOption`](./asyncOrElseOption.ts): 對同步 Option 執行異步回退。
- [`asyncTapOption`](./asyncTapOption.ts): 對同步 Option 執行異步副作用。

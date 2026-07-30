# Observability (可觀測性)

`observability` 模組提供了針對 Result 操作過程的上下文追蹤、格式化輸出、內部狀態檢視與事件訂閱等工具，協助進行除錯與系統監控。

## API 列表

- [`ctx`](./ctx.ts): 處理路徑與上下文堆疊的核心工具。
- [`format`](./format.ts): 用於將 `IResultOfT` 或 `IOption` 格式化為易讀字串的工具。
- [`inspect`](./inspect.ts): 用於檢視與剖析 Result 內部結構的工具函數。
- [`observe`](./observe.ts): 事件觀察器，提供註冊與觸發觀測事件的能力 (`installObserver`, `getActiveObserver`)。
- [`tapErrContext`](./tapErrContext.ts): 在發生錯誤時，將當前的上下文資訊注入並觸發副作用。
- [`withPath`](./withPath.ts): 在執行特定代碼區塊時，注入指定的路徑上下文以便於追蹤。

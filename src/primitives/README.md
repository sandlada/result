# Primitives (基礎原語)

`primitives` 模組提供底層的高階邏輯抽象，包括條件分支處理與集合折疊，為其他模組提供構建基石。

## API 列表

- [`cond`](./cond.ts): 條件匹配器，根據不同斷言返回對應的 Result。
- [`condErr`](./condErr.ts): 錯誤條件匹配器，專注於基於錯誤類型的分支路由。
- [`lift`](./lift.ts): 將普通函數提升為操作 Result 類型的函數。
- [`partitionOption`](./partitionOption.ts): 將包含 Option 的集合劃分為 `Some` 與 `None` 兩組。
- [`reduce`](./reduce.ts): 對包含 Result 的集合進行安全的折疊運算。
- [`sequence`](./sequence.ts): 將 Option 或 Result 的數組轉換為包含數組的 Option/Result。
- [`sequenceAsyncResult`](./sequenceAsyncResult.ts): 將 `AsyncResult` 的數組進行序列化解析。

# Factories (構造工廠)

`factories` 模組提供了創建 `IResultOfT` 與 `Promise<IResultOfT>` 實例的核心基礎工廠函數。

## API 列表

- [`asyncErr`](./asyncErr.ts): 快速創建一個處於 `Err` 狀態並被 Promise 包裹的結果 (`Promise<IResultOfT>`)。
- [`asyncOk`](./asyncOk.ts): 快速創建一個處於 `Ok` 狀態並被 Promise 包裹的結果 (`Promise<IResultOfT>`)。
- [`err`](./err.ts): 創建一個同步的 `Err` 實例。
- [`fromPredicate`](./fromPredicate.ts): 根據條件判斷，將值轉換為 `Ok` 或 `Err`。
- [`fromPromise`](./fromPromise.ts): 將原生 Promise 封裝為返回 `Promise<IResultOfT>`，自動捕獲拒絕（Rejection）。
- [`fromSafePromise`](./fromSafePromise.ts): 將已知不會失敗的 Promise 封裝為 `Promise<IResultOfT>`。
- [`fromThrowable`](./fromThrowable.ts): 捕獲同步函數的異常並封裝為 `IResultOfT`。
- [`ok`](./ok.ts): 創建一個同步的 `Ok` 實例。
- [`tryCatch`](./tryCatch.ts): 執行同步代碼塊，成功返回 `Ok`，捕獲異常並轉換為 `Err`。
- [`tryCatchAsync`](./tryCatchAsync.ts): 執行異步代碼塊，成功返回 `Ok`，捕獲異常與 Promise 拒絕並轉換為 `Err`。

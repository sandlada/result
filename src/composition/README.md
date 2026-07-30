# Composition (組合與管線)

`composition` 模組提供了函數組合（Composition）與管線（Pipeline）操作工具，方便將多個處理步驟串聯為流暢的鐵路導向（ROP）工作流。

## API 列表

- [`composeK`](./composeK.ts): Kleisli 組合，用於將多個返回 `IResultOfT` 的同步函數組合成單一函數。
- [`composeKAsync`](./composeKAsync.ts): 異步 Kleisli 組合，用於處理返回 `Promise<IResultOfT>` 的函數。
- [`pipe`](./pipe.ts): 函數管道操作符，將初始值同步傳遞經過一系列函數。
- [`pipeAsync`](./pipeAsync.ts): 異步管道操作符，處理包含 Promise 或異步操作的函數鏈。
- [`safeTry`](./safeTry.ts) / [`fromSafeTry`](./safeTry.ts): 基於生成器（Generator）的 Do-notation 實現，允許以類似同步的語法編寫安全的 Result 鏈。

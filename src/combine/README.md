# Combine (組合操作)

`combine` 模組專注於同時處理多個 `IResultOfT` 或 `IOption` 的集合操作，提供短路（Short-circuiting）與錯誤聚合等不同策略。

## API 列表

- [`all`](./all.ts): 組合多個 Option，若全部存在則返回值的數組。
- [`combine`](./combine.ts): 組合多個 Result，遇到第一個 `Err` 即短路並返回。
- [`combineWithAllErrors`](./combineWithAllErrors.ts): 組合多個 Result，收集所有成功的結果；若有錯誤，則彙整並返回所有錯誤。
